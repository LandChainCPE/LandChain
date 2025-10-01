package controller

import (
	"math/big"
	"net/http"
	"strconv"
	"strings"

	"landchain/config"
	"landchain/entity"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
)

func GetTransationByUserID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	var transactions []entity.Transaction
	db := config.DB()

	err = db.Preload("Landtitle").
		Preload("Buyer").
		Preload("Seller").
		Preload("Typetransaction").
		Where("(seller_id = ? OR buyer_id = ?) AND deleted_at IS NULL", id, id).
		Find(&transactions).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

func UpdateTransactionBuyerAccept(c *gin.Context) {
	sellerId := c.Query("sellerID")
	buyerId := c.Query("buyerID")
	landId := c.Query("landID")

	if sellerId == "" || buyerId == "" || landId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sellerID, buyerID และ landID จำเป็น"})
		return
	}

	db := config.DB()

	// --- ดึง walletAddress ของ Seller ---
	var seller entity.Users
	if err := db.First(&seller, "id = ?", sellerId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ขาย"})
		return
	}
	walletAddress := common.HexToAddress(seller.Metamaskaddress)

	// --- ดึง tokenID ของ Land จาก LandTitle ---
	var land entity.Landtitle
	if err := db.First(&land, "id = ? AND is_locked = true", landId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบที่ดิน"})
		return
	}

	tokenId := new(big.Int)
	if _, ok := tokenId.SetString(strconv.Itoa(int(*land.TokenID)), 10); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tokenId"})
		return
	}

	// --- ตรวจสอบ owner ใน Smart Contract ---
	if ContractInstance == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contract not initialized"})
		return
	}

	owner, err := ContractInstance.Contract.OwnerOf(&ContractInstance.CallOpts, tokenId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถตรวจสอบเจ้าของที่ดินได้", "detail": err.Error()})
		return
	}

	if owner != walletAddress {
		c.JSON(http.StatusForbidden, gin.H{"error": "seller ไม่ใช่เจ้าของที่ดินนี้"})
		return
	}

	// --- ถ้าเป็นเจ้าของจริง ค่อย Update Transaction ---
	var existingTransaction entity.Transaction
	if err := db.First(&existingTransaction, "seller_id = ? AND buyer_id = ? AND land_id = ? AND deleted_at IS NULL", sellerId, buyerId, landId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบธุรกรรมที่ต้องการอัปเดต"})
		return
	}

	existingTransaction.BuyerAccepted = true

	if err := db.Save(&existingTransaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตธุรกรรมได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "อัปเดตธุรกรรมเรียบร้อย",
		"transaction": existingTransaction,
	})
}

func DeleteTransactionTodelete(c *gin.Context) {
	transactionIDStr := c.Param("id")

	if transactionIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ transactionID"})
		return
	}

	transactionID, err := strconv.Atoi(transactionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "transactionID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	// 0️⃣ ดึง Transaction มาก่อน เพื่อรู้ TokenID
	var tx entity.Transaction
	if err := db.First(&tx, transactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบธุรกรรมนี้"})
		return
	}

	// 1️⃣ ปลดล็อกที่ดินด้วย TokenID
	if tx.LandID != 0 {
		if err := db.Model(&entity.Landtitle{}).
			Where("id = ?", tx.LandID).
			Update("is_locked", false).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถปลดล็อกโฉนดได้", "detail": err.Error()})
			return
		}
	}

	// 2️⃣ Update typetransaction_id
	if err := db.Model(&entity.Transaction{}).
		Where("id = ?", transactionID).
		Update("typetransaction_id", 2).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตได้", "detail": err.Error()})
		return
	}

	// 3️⃣ Delete Transaction
	if err := db.Where("id = ?", transactionID).
		Delete(&entity.Transaction{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลได้", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ปลดล็อกโฉนด อัปเดต typetransaction และลบข้อมูลเรียบร้อย",
	})
}

func DeleteTransactionToscucess(c *gin.Context) {
	transactionIDStr := c.Param("id")

	if transactionIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ transactionID"})
		return
	}

	transactionID, err := strconv.Atoi(transactionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "transactionID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	// 1️⃣ Update typetransaction_id ก่อน
	if err := db.Model(&entity.Transaction{}).
		Where("id = ?", transactionID).
		Update("typetransaction_id", 5).
		Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตได้", "detail": err.Error()})
		return
	}

	// 2️⃣ Delete record หลังจาก update
	if err := db.Where("id = ?", transactionID).
		Delete(&entity.Transaction{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลได้", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "อัปเดต typetransaction และลบข้อมูลเรียบร้อย"})
}

func DeleteTransactionandAllrequest(c *gin.Context) {
	transactionIDStr := c.Param("id")

	if transactionIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ transactionID"})
		return
	}

	transactionID, err := strconv.Atoi(transactionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "transactionID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	// 1️⃣ หา transaction เพื่อดึง LandID
	var tx entity.Transaction
	if err := db.First(&tx, transactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ transaction", "detail": err.Error()})
		return
	}

	landID := tx.LandID // ✅ ใช้ LandID จาก transaction

	// 2️⃣ Update typetransaction_id ก่อน
	if err := db.Model(&entity.Transaction{}).
		Where("id = ?", transactionID).
		Update("typetransaction_id", 2).
		Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตได้", "detail": err.Error()})
		return
	}

	// 3️⃣ Delete transaction
	if err := db.Where("id = ?", transactionID).Delete(&entity.Transaction{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบ transaction ได้", "detail": err.Error()})
		return
	}

	// 4️⃣ Delete all requests by LandID
	if landID != 0 {
		if err := db.Where("land_id = ?", landID).Delete(&entity.RequestBuySell{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบ requests ได้", "detail": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบ transaction และ request ทั้งหมดเรียบร้อย"})
}

func LoadUpdateSetsale(c *gin.Context) {
	transactionIDStr := c.Param("id")

	if transactionIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ transactionID"})
		return
	}

	transactionID, err := strconv.Atoi(transactionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "transactionID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	// 1️⃣ หา transaction (เฉพาะที่ยังไม่ถูกลบ)
	var tx entity.Transaction
	if err := db.Where("id = ? AND deleted_at IS NULL", transactionID).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ transaction หรือถูกลบไปแล้ว", "detail": err.Error()})
		return
	}

	// 🚨 ถ้า typetransaction_id = 4 → return เลย
	if tx.TypetransactionID == 4 {
		c.JSON(http.StatusOK, gin.H{
			"transactionID": transactionID,
			"landID":        tx.LandID,
			"message":       "ไม่ดึงข้อมูลจาก Smart Contract เนื่องจาก on chain แล้ว",
		})
		return
	}

	// 2️⃣ ดึง Landtitle
	var landData entity.Landtitle
	if err := db.Where("id = ?", tx.LandID).First(&landData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึง Landtitle ได้", "detail": err.Error()})
		return
	}

	if landData.TokenID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Landtitle ไม่มี TokenID"})
		return
	}
	tokenID := big.NewInt(int64(*landData.TokenID))

	// 3️⃣ ดึง Metadata จาก SmartContract
	meta, err := ContractInstance.GetLandMetadata(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึง Metadata ไม่สำเร็จ", "detail": err.Error()})
		return
	}

	// 4️⃣ ดึง Wallet ของ Buyer/Seller จาก DB
	var buyer entity.Users
	if err := db.First(&buyer, tx.BuyerID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึง Buyer ได้", "detail": err.Error()})
		return
	}

	var seller entity.Users
	if err := db.First(&seller, tx.SellerID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึง Seller ได้", "detail": err.Error()})
		return
	}

	// 5️⃣ เทียบ Wallet DB กับ Blockchain
	updated := false
	if strings.EqualFold(buyer.Metamaskaddress, meta.Buyer.Hex()) &&
		strings.EqualFold(seller.Metamaskaddress, meta.WalletID.Hex()) {
		// Update TypetransactionID = 4
		if err := db.Model(&tx).Update("typetransaction_id", 4).Error; err == nil {
			updated = true
		}
	}

	// 6️⃣ ส่ง Response
	c.JSON(http.StatusOK, gin.H{
		"transactionID": transactionID,
		"landID":        tx.LandID,
		"tokenID":       tokenID.String(),
		"metaFields":    meta.MetaFields,
		"price":         meta.Price.String(),
		"buyer":         meta.Buyer.Hex(),
		"walletID":      meta.WalletID.Hex(),
		"updated":       updated,
	})
}

func LoadTransactionAfterBuy(c *gin.Context) {
	transactionIDStr := c.Param("id")

	if transactionIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ transactionID"})
		return
	}

	transactionID, err := strconv.Atoi(transactionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "transactionID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	// 1️⃣ หา transaction (เฉพาะที่ยังไม่ถูกลบ)
	var tx entity.Transaction
	if err := db.Where("id = ? AND deleted_at IS NULL", transactionID).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ transaction หรือถูกลบไปแล้ว", "detail": err.Error()})
		return
	}

	// 🚨 ถ้า typetransaction_id = 5 → return เลย
	if tx.TypetransactionID == 5 {
		c.JSON(http.StatusOK, gin.H{
			"transactionID": transactionID,
			"landID":        tx.LandID,
			"message":       "ข้อมูลอัพเดทแล้ว ไม่ต้องดึง Smart Contract",
		})
		return
	}

	// 2️⃣ ดึง Landtitle
	var landData entity.Landtitle
	if err := db.Where("id = ?", tx.LandID).First(&landData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึง Landtitle ได้", "detail": err.Error()})
		return
	}

	if landData.TokenID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Landtitle ไม่มี TokenID"})
		return
	}
	tokenID := big.NewInt(int64(*landData.TokenID))

	// 3️⃣ ดึง history ownership ล่าสุด 2 รายการ
	history, err := ContractInstance.GetOwnershipHistory(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึง Ownership History ไม่สำเร็จ", "detail": err.Error()})
		return
	}

	if len(history) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ownership History มีไม่พอ"})
		return
	}

	// เอา 2 รายการล่าสุด
	latestHistory := history[len(history)-2:]

	// 4️⃣ ดึง wallet ของ Buyer/Seller
	var buyer entity.Users
	if err := db.First(&buyer, tx.BuyerID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึง Buyer ได้", "detail": err.Error()})
		return
	}

	var seller entity.Users
	if err := db.First(&seller, tx.SellerID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึง Seller ได้", "detail": err.Error()})
		return
	}

	// 5️⃣ ตรวจสอบลำดับ wallet (latestHistory[0] = ก่อนหน้า, latestHistory[1] = ล่าสุด)
	if strings.EqualFold(latestHistory[0].Hex(), seller.Metamaskaddress) &&
		strings.EqualFold(latestHistory[1].Hex(), buyer.Metamaskaddress) {

		// อัพเดท TypetransactionID = 5
		if err := db.Model(&tx).Update("typetransaction_id", 5).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "อัพเดท TypetransactionID ไม่สำเร็จ", "detail": err.Error()})
			return
		}

		// 6️⃣ Soft delete transaction ทันที
		if err := db.Delete(&tx).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "soft delete transaction ไม่สำเร็จ", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"transactionID": transactionID,
			"landID":        tx.LandID,
			"message":       "อัพเดทและลบ transaction สำเร็จ",
			"history":       latestHistory,
		})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{
		"transactionID": transactionID,
		"landID":        tx.LandID,
		"message":       "Wallet ของ Buyer/Seller ไม่ตรงกับ history ล่าสุดหรือลำดับไม่ถูกต้อง",
		"history":       latestHistory,
	})
}
