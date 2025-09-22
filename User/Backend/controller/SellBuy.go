package controller

import (
	"landchain/config" // เปลี่ยนเป็น path ที่ถูกต้องของ Go bindings ที่คุณสร้าง เช่น "contract" หรือชื่อที่ตรงกับไฟล์ go ที่ได้จาก abigen
	"landchain/entity" // แก้ชื่อ module ให้ตรงกับโปรเจกต์คุณ
	"landchain/services"
	"strings"

	//"time"

	"log"
	"net/http"

	"strconv"

	"github.com/gin-gonic/gin"
)

// GetBookings ดึงข้อมูลการจองทั้งหมดพร้อมชื่อผู้ใช้และเวลา
// GetAllPostLandData ดึงข้อมูลการขายที่ดินทั้งหมด พร้อมข้อมูลโฉนดที่ดิน (Landtitle)

func GetAllLandTitleByUserID(c *gin.Context) {
	db := config.DB()

	// รับ user_id จาก query param
	userIDStr := c.Param("id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ user_id"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id ต้องเป็นตัวเลข"})
		return
	}

	var lands []entity.Landtitle

	// preload ข้อมูล Geography / Province / Amphure / Tambon
	if err := db.Preload("Geography").
		Preload("Province").
		Preload("Amphure").
		Preload("Tambon").
		Preload("Status").
		Where("user_id = ?", userID).
		Find(&lands).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลที่ดินได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"landtitles": lands})
}

func CreateTransaction(c *gin.Context) {
	var transaction entity.Transaction

	// รับข้อมูลจาก request body
	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	db := config.DB()

	// รับ tokenID จาก query params
	tokenID := c.Query("landID")
	if tokenID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "TokenID ไม่ถูกต้อง"})
		return
	}

	// ดึง Landtitle จาก tokenID
	var land entity.Landtitle
	if err := db.Where("token_id = ?", tokenID).First(&land).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบโฉนด"})
		return
	}

	// เช็คว่า Land เคยมี Transaction ที่สำเร็จแล้วหรือถูกยกเลิกหรือยัง
	var lastTransaction entity.Transaction
	if err := db.Where("land_id = ?", land.ID).
		Order("id DESC").
		First(&lastTransaction).Error; err == nil {
		if lastTransaction.TypetransactionID != 2 && lastTransaction.TypetransactionID != 3 {
			c.JSON(http.StatusForbidden, gin.H{"error": "ไม่สามารถสร้างธุรกรรมใหม่ได้ เนื่องจากธุรกรรมก่อนหน้ายังไม่เสร็จสิ้นหรือไม่ถูกยกเลิก"})
			return
		}
	}

	// เช็คว่าโฉนดถูกล็อกหรือไม่
	if land.IsLocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "โฉนดนี้มี Transaction อยู่แล้ว"})
		return
	}

	// เอา land.ID ไปเขียนใน Transaction เลย
	transaction.LandID = land.ID

	// รับ sellerID, buyerID, amount จาก query params
	sellerIDStr := c.Query("sellerID")
	sellerID, err := strconv.ParseUint(sellerIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "SellerID ไม่ถูกต้อง"})
		return
	}
	transaction.SellerID = uint(sellerID)

	buyerIDStr := c.Query("buyerID")
	buyerID, err := strconv.ParseUint(buyerIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "BuyerID ไม่ถูกต้อง"})
		return
	}
	transaction.BuyerID = uint(buyerID)

	amountStr := c.Query("amount")
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount ไม่ถูกต้อง"})
		return
	}
	transaction.Amount = amount

	// เซ็ตค่าเริ่มต้น Transaction
	transaction.TypetransactionID = 1
	transaction.BuyerAccepted = false
	transaction.SellerAccepted = true
	transaction.LandDepartmentApproved = false
	transaction.TxHash = nil

	// สร้าง Transaction
	if err := db.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างธุรกรรมได้"})
		return
	}

	// อัพเดท Landtitle เป็นล็อก
	land.IsLocked = true
	if err := db.Save(&land).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้าง Transaction สำเร็จ แต่ไม่สามารถล็อกโฉนดได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transaction": transaction, "land": land})
}

func UpdateTransactionLandDepartmentAccept(c *gin.Context) {
	// รับ ID ของธุรกรรมจาก URL parameter
	transactionID := c.Param("id")

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ค้นหาธุรกรรมที่ต้องการอัปเดต
	var existingTransaction entity.Transaction
	if err := db.First(&existingTransaction, "id = ?", transactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบธุรกรรมที่ต้องการอัปเดต"})
		return
	}

	// ตั้งค่า LandDepartmentApproved เป็น true โดยตรง
	existingTransaction.LandDepartmentApproved = true

	// บันทึกการอัปเดตในฐานข้อมูล
	if err := db.Save(&existingTransaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตธุรกรรมได้"})
		return
	}

	// ส่งคืนข้อมูลธุรกรรมที่อัปเดตแล้ว
	c.JSON(http.StatusOK, gin.H{"transaction": existingTransaction})
}

func CheckTransactionStatusAndTriggerContract() {
	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ค้นหาธุรกรรมที่สถานะครบ
	var transactions []entity.Transaction
	err := db.Where("buyer_accepted = ? AND seller_accepted = ? AND land_department_approved = ?", true, true, true).Find(&transactions).Error
	if err != nil {
		log.Println("ไม่สามารถดึงข้อมูลธุรกรรม:", err)
		return
	}

	// หากสถานะครบทุกเงื่อนไข
	for _, transaction := range transactions {
		// เรียกฟังก์ชัน trigger smart contract
		triggerSmartContract(transaction)
	}
}

// ฟังก์ชัน trigger smart contract
func triggerSmartContract(transaction entity.Transaction) {
	// สมมติว่าเราเรียก smart contract ผ่าน Web3

	log.Println("Smart contract called successfully, transaction hash:")
}

func GetAllTransation(c *gin.Context) {
	var Transaction []entity.Transaction
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.Find(&Transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, Transaction)
}

func GetInfoUserByWalletID(c *gin.Context) {
	var User []entity.Users
	walletValue, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wallet not found"})
		return
	}

	walletAddr, ok := walletValue.(string)
	if !ok || walletAddr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wallet invalid"})
		return
	}
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.First(&User).Where("metamaskaddress = ?", walletAddr).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ได้"})
		return
	}

	c.JSON(http.StatusOK, User)
}

func GetLandInfoByTokenID(c *gin.Context) {
	var Land []entity.Landtitle
	TokenID := c.Param("id")
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.Preload("Geography").
		Preload("Province").
		Preload("Amphure").
		Preload("Tambon").Where("land_token = ?", TokenID).First(&Land).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโฉลดได้"})
		return
	}

	c.JSON(http.StatusOK, Land)
}

func GetInfoUserByToken(c *gin.Context) {
	// ดึง wallet จาก context ที่ middleware เก็บไว้
	wallet, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wallet not found in token"})
		return
	}

	db := config.DB()

	var user entity.Users
	if err := db.Where("metamaskaddress = ?", wallet.(string)).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":             user.ID,
		"first_name":     user.Firstname,
		"last_name":      user.Lastname,
		"email":          user.Email,
		"wallet_address": user.Metamaskaddress,
	})
}

func GetRequestBuyByTokenID(c *gin.Context) {
	tokenIDParam := c.Param("id")

	// แปลง tokenID เป็น uint
	tokenID, err := strconv.ParseUint(tokenIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tokenID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	var requests []entity.RequestBuySell

	// Preload Landtitle แบบ filter token_id, และ preload relation อื่น ๆ
	if err := db.Preload("Landtitle", "token_id = ?", tokenID).
		Preload("Seller").
		Preload("Buyer").
		Preload("RequestBuySellType").
		Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลคำขอซื้อได้"})
		return
	}

	// กรองเอาเฉพาะ request ที่ Landtitle ไม่เป็น nil (tokenID ตรง)
	filteredRequests := []entity.RequestBuySell{}
	for _, r := range requests {
		if r.Landtitle.ID != 0 {
			filteredRequests = append(filteredRequests, r)
		}
	}

	c.JSON(http.StatusOK, filteredRequests)
}

func DeleteRequestBuyByUserIDAndLandID(c *gin.Context) {
	landIDStr := c.Query("landID")
	userIDStr := c.Query("userID")

	if landIDStr == "" || userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ landID และ userID"})
		return
	}

	landID, err1 := strconv.Atoi(landIDStr)
	userID, err2 := strconv.Atoi(userIDStr)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "landID และ userID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	if err := db.Where("land_id = ? AND buyer_id = ?", landID, userID).Delete(&entity.RequestBuySell{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลได้", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบคำขอซื้อเรียบร้อย"})
}

// สมมติ contractInstance ถูก init แล้วเป็น global

func SetSellInfoHandler(c *gin.Context) {
	var req struct {
		TokenID  int     `json:"tokenId"`
		PriceTHB float64 `json:"priceTHB"`
		Buyer    string  `json:"buyer"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	signature, wei, err := services.SignLandSalePacked(req.TokenID, req.PriceTHB, req.Buyer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tokenId":   req.TokenID,
		"wei":       wei, // ✅ wei แล้ว
		"buyer":     req.Buyer,
		"signature": signature,
	})
}

func DeleteAllRequestBuy(c *gin.Context) {
	landIDStr := c.Query("landID")

	if landIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ landID และ userID"})
		return
	}

	landID, err1 := strconv.Atoi(landIDStr)
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "landID และ userID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	if err := db.Where("land_id = ? ", landID).Delete(&entity.RequestBuySell{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลได้", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบคำขอทั้งหมด"})
}

func GetInfoUsersByWallets(c *gin.Context) {
	var wallets []string
	if err := c.BindJSON(&wallets); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาส่ง wallet เป็น array"})
		return
	}

	// แปลง wallets ทั้งหมดเป็น lowercase
	for i := range wallets {
		wallets[i] = strings.ToLower(wallets[i])
	}

	var users []entity.Users
	db := config.DB()

	// ใช้ LOWER ใน query เพื่อให้ match case-insensitive
	if err := db.Where("LOWER(metamaskaddress) IN ?", wallets).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ได้"})
		return
	}

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func DeleteAllRequestBuyByLandID(c *gin.Context) {
	landIDStr := c.Query("landID")

	if landIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ landID และ userID"})
		return
	}

	landID, err1 := strconv.Atoi(landIDStr)

	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "landID และ userID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	if err := db.Where("land_id = ?", landID).Delete(&entity.RequestBuySell{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลได้", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบคำขอซื้อเรียบร้อย"})
}

func GetRequestBuybyLandID(c *gin.Context) {
	tokenID := c.Param("id")
	db := config.DB()

	// หา Landtitle ที่มี tokenID
	var land entity.Landtitle
	if err := db.Where("token_id = ?", tokenID).First(&land).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบที่ดิน"})
		return
	}

	// ดึง RequestBuySell ตาม land_id
	var requests []entity.RequestBuySell
	if err := db.Where("land_id = ?", land.ID).
		Preload("Seller").
		Preload("Buyer").
		Preload("RequestBuySellType").
		Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ได้"})
		return
	}

	c.JSON(http.StatusOK, requests)
}

func DeleteLandsalepostByLandID(c *gin.Context) {
	tokenID := c.Query("tokenID")

	if tokenID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tokenID จำเป็น"})
		return
	}

	db := config.DB()

	// หา landID จาก tokenID
	var land entity.Landtitle
	if err := db.First(&land, "token_id = ?", tokenID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบที่ดินตาม tokenID"})
		return
	}
	landID := land.ID

	// หา Landsalepost ของ landID
	var post entity.Landsalepost
	if err := db.First(&post, "land_id = ?", landID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประกาศขายที่ดินนี้"})
		return
	}

	// ลบประกาศ (soft delete)
	if err := db.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบประกาศขายที่ดินได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบประกาศขายที่ดินเรียบร้อยแล้ว"})
}
