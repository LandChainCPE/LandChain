package controller

import (
	"net/http"
	"strconv"

	"landchain/config"
	"landchain/entity"
	"landchain/websocket" // เปลี่ยน path ตาม project

	"github.com/gin-gonic/gin"
	gorillaWs "github.com/gorilla/websocket"
)

var upgrader = gorillaWs.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func TransactionWS(hub *websocket.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}

		walletValue, exists := c.Get("wallet")
		if !exists {
			conn.WriteJSON(map[string]string{"error": "wallet not found"})
			conn.Close()
			return
		}

		userWallet, ok := walletValue.(string)
		if !ok || userWallet == "" {
			conn.WriteJSON(map[string]string{"error": "wallet invalid"})
			conn.Close()
			return
		}

		client := &websocket.Client{
			Wallet: userWallet,
			Conn:   conn,
			Send:   make(chan websocket.Transaction, 10),
		}

		hub.Register(client)

		// ส่ง transaction ล่าสุด
		// transactions, _ := GetTransactionsByWallet(userWallet)
		// conn.WriteJSON(transactions)

		// run read / write pump
		go client.WritePump()
		go client.ReadPump(hub)
	}
}

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
	// รับ ID ของธุรกรรมจาก URL parameter
	sellerId := c.Query("sellerID")
	buyerId := c.Query("buyerID")
	landId := c.Query("landID")

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ค้นหาธุรกรรมที่ต้องการอัปเดต
	var existingTransaction entity.Transaction
	if err := db.First(&existingTransaction, "seller_id = ? AND buyer_id = ? AND land_id = ?", sellerId, buyerId, landId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบธุรกรรมที่ต้องการอัปเดต"})
		return
	}

	// ตั้งค่า SellerAccepted เป็น true โดยตรง
	existingTransaction.BuyerAccepted = true

	// บันทึกการอัปเดตในฐานข้อมูล
	if err := db.Save(&existingTransaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตธุรกรรมได้"})
		return
	}

	// ส่งคืนข้อมูลธุรกรรมที่อัปเดตแล้ว
	c.JSON(http.StatusOK, gin.H{"transaction": existingTransaction})
}

func DeleteTransaction(c *gin.Context) {
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
		Update("typetransaction_id", 3). // ← ใส่ค่าที่คุณต้องการ เช่น 3 = canceled
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
