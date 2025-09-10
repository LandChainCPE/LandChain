package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAllRequestSellByUserID(c *gin.Context) {
	// ดึง wallet address ของผู้ใช้งานที่ login
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบผู้ใช้งาน"})
		return
	}

	var user entity.Users
	db := config.DB()

	// หา user ID จาก wallet address
	if err := db.Where("metamaskaddress = ?", walletAddr).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้งาน"})
		return
	}

	var requests []entity.RequestBuySell

	// ดึง request ของผู้ใช้งาน พร้อม preload Buyer, Seller, Landtitle
	if err := db.Preload("Buyer").
		Preload("Seller").
		Preload("Landtitle").
		Where("buyer_id = ?", user.ID).
		Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบข้อมูลคำขอซื้อ"})
		return
	}

	// Map ให้ response JSON เป็นแบบ structured

	c.JSON(http.StatusOK, requests)
}

func DeleteRequestSellByUserIDAndLandID(c *gin.Context) {
	landIDStr := c.Query("landID")
	sellerIDStr := c.Query("sellerID")
	buyerIDStr := c.Query("buyerID")

	if landIDStr == "" || sellerIDStr == "" || buyerIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ landID, sellerID และ buyerID"})
		return
	}

	landID, err1 := strconv.Atoi(landIDStr)
	sellerID, err2 := strconv.Atoi(sellerIDStr)
	buyerID, err3 := strconv.Atoi(buyerIDStr)

	if err1 != nil || err2 != nil || err3 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "landID, sellerID และ buyerID ต้องเป็นตัวเลข"})
		return
	}

	db := config.DB()

	if err := db.Where("land_id = ? AND seller_id = ? AND buyer_id = ?", landID, sellerID, buyerID).
		Delete(&entity.RequestBuySell{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลได้", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบคำขอซื้อเรียบร้อย"})
}

func GetAllRequestSellByUserIDAndDelete(c *gin.Context) {
	// ดึง wallet address ของผู้ใช้งานที่ login
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบผู้ใช้งาน"})
		return
	}

	var user entity.Users
	db := config.DB()

	// หา user ID จาก wallet address
	if err := db.Where("metamaskaddress = ?", walletAddr).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้งาน"})
		return
	}

	var requests []entity.RequestBuySell

	// ดึง request ของผู้ใช้งาน พร้อม preload Buyer, Seller, Landtitle
	if err := db.Unscoped().Preload("Buyer").
		Preload("Seller").
		Preload("Landtitle").
		Where("buyer_id = ? AND deleted_at IS NOT NULL", user.ID).
		Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบข้อมูลคำขอซื้อ"})
		return
	}

	// Map ให้ response JSON เป็นแบบ structured

	c.JSON(http.StatusOK, requests)
}
