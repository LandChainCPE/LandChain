package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetLandtitlesByCurrentUser ดึงข้อมูล landtitle ของผู้ใช้ที่ login
func GetLandtitlesByUser(c *gin.Context) {
	// ดึง userId จาก path parameter
	userIDCtx, exists := c.Get("userID")
	db := config.DB()
	var landtitles []entity.Landtitle
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	if err := db.Where("user_id = ?", userIDCtx).Find(&landtitles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, landtitles)
}
