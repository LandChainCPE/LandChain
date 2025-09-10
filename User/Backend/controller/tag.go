package controller

import (
	"net/http"
	"landchain/entity"
	"github.com/gin-gonic/gin"
	"landchain/config"
)
//r.GET("/tags", controller.GetTags)

// ฟังก์ชันดึงข้อมูลทั้งหมดของ Tag
func GetTags(c *gin.Context) {
	var tags []entity.Tag

	// ดึงข้อมูล Tag ทั้งหมด
	if err := config.DB().Preload("Landsalepost").Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch tags"})
		return
	}

	// ส่งข้อมูล Tag ที่ดึงมาไปยัง client
	c.JSON(http.StatusOK, tags)
}
