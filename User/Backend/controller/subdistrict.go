package controller

import (
	"net/http"

	"landchain/config"  // นำเข้า config สำหรับการเชื่อมต่อกับฐานข้อมูล
	"landchain/entity"  // นำเข้า entity สำหรับข้อมูล Subdistrict
	"github.com/gin-gonic/gin"
)

// ฟังก์ชันดึงข้อมูลตำบล
func GetSubdistrict(c *gin.Context) {
	districtID := c.Query("district") // ใช้ Query แทน Param

	var subdistricts []entity.Subdistrict
	if err := config.DB().Where("district_id = ?", districtID).Find(&subdistricts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลตำบลได้"})
		return
	}
	c.JSON(http.StatusOK, subdistricts)
}
