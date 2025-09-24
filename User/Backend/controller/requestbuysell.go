package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateRequestBuySellRequest struct {
	BuyerID uint `json:"buyer_id" binding:"required"`
	LandID  uint `json:"land_id" binding:"required"`
}

func CreateRequestBuySellHandler(c *gin.Context) {
	var req CreateRequestBuySellRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ดึงโพสต์ขายที่ดินเพื่อหา SellerID และ LandtitleID
	var landPost entity.Landsalepost
	if err := config.DB().First(&landPost, req.LandID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบโพสต์ขายที่ดิน"})
		return
	}

	// ป้องกันไม่ให้ user ซื้อโพสต์ของตัวเอง (UserID ของโพสต์ต้องไม่ตรงกับ BuyerID)
	if req.BuyerID == landPost.UserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถซื้อโพสต์ของตัวเองได้"})
		return
	}

	request := entity.RequestBuySell{
		BuyerID:  req.BuyerID,
		SellerID: landPost.UserID,
		LandID:   landPost.LandID, // ใช้ ID ของโพสต์
	}

	if err := config.DB().Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, request)
}
