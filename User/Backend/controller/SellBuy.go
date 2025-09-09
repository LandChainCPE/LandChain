package controller

import (
	"landchain/config" // เปลี่ยนเป็น path ที่ถูกต้องของ Go bindings ที่คุณสร้าง เช่น "contract" หรือชื่อที่ตรงกับไฟล์ go ที่ได้จาก abigen
	"landchain/entity" // แก้ชื่อ module ให้ตรงกับโปรเจกต์คุณ

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

func GetAllRequestByLandID(c *gin.Context) {
	LandID := c.Param("id")

	var Land []entity.RequestSell
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.Preload("Users").Where("land_id = ?", LandID).Find(&Land).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, Land)
}

func GetAllRequestSellByUserID(c *gin.Context) {
	UserID := c.Param("id")

	var Land []entity.RequestBuy
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.Preload("Landtitle").Preload("Landtitle.Users").Where("user_id = ?", UserID).Find(&Land).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, Land)
}

func CreateTransaction(c *gin.Context) {
	// สร้างตัวแปรธุรกรรม
	var transaction entity.Transaction

	// รับข้อมูลจาก request body
	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	// เซ็ตค่าเริ่มต้นให้เป็น false
	transaction.Amount = 0
	transaction.TypetransactionID = 1
	transaction.BuyerAccepted = true
	transaction.SellerAccepted = false
	transaction.MoneyChecked = true
	transaction.LandDepartmentApproved = false

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// สร้างธุรกรรมใหม่ในฐานข้อมูล
	if err := db.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างธุรกรรมได้"})
		return
	}

	// ส่งคืนข้อมูลธุรกรรมที่สร้างแล้ว
	c.JSON(http.StatusOK, gin.H{"transaction": transaction})
}

func UpdateTransactionSellerAccept(c *gin.Context) {
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

	// ตั้งค่า SellerAccepted เป็น true โดยตรง
	existingTransaction.SellerAccepted = true

	// บันทึกการอัปเดตในฐานข้อมูล
	if err := db.Save(&existingTransaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตธุรกรรมได้"})
		return
	}

	// ส่งคืนข้อมูลธุรกรรมที่อัปเดตแล้ว
	c.JSON(http.StatusOK, gin.H{"transaction": existingTransaction})
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

func GetTransationByUserID(c *gin.Context) {
	UserID := c.Param("id")

	var Transaction []entity.Transaction
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.Preload("Landtitle").Preload("Buyer").Preload("Seller").Preload("Typetransaction").Where("seller_id = ?", UserID).Find(&Transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, Transaction)
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

func GetInfoUserByUserID(c *gin.Context) {
	var User []entity.Users
	UserID := c.Param("id")
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.First(&User).Where("id = ?", UserID).Error; err != nil {
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

// สมมติ contractInstance ถูก init แล้วเป็น global
