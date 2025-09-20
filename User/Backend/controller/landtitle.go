package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)
// GetLandtitlesByUserID ดึงข้อมูล landtitles ของผู้ใช้จาก user_id
func GetLandtitlesByUserID(c *gin.Context) {
    userid := c.Param("userid")
    db := config.DB()
    var landtitles []entity.Landtitle
    if err := db.Where("user_id = ?", userid).Find(&landtitles).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, landtitles)
}