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
	paramID := c.Param("userId")
	db := config.DB()
	var landtitles []entity.Landtitle
	if err := db.Preload("Province").Preload("District").Preload("Subdistrict").Preload("LandVerification").Preload("User").Where("user_id = ?", paramID).Find(&landtitles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, landtitles)
}
