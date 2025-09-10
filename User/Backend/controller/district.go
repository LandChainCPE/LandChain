package controller

import (
	"net/http"

	"landchain/config"  // นำเข้า config สำหรับการเชื่อมต่อกับฐานข้อมูล
	"landchain/entity"  // นำเข้า entity สำหรับข้อมูล District
	"github.com/gin-gonic/gin"
)

// ฟังก์ชันดึงข้อมูลอำเภอ
func GetDistrict(c *gin.Context) {
    provinceID := c.Param("id") // ใช้ Param แทน Query

    var districts []entity.District
    if err := config.DB().Where("province_id = ?", provinceID).Find(&districts).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลอำเภอได้"})
        return
    }
    c.JSON(http.StatusOK, districts)
}
func GetAllProvinces(c *gin.Context) {
	var provinces []entity.Province

	// preload ทุกระดับที่จำเป็น
	if err := config.DB().
		Preload("District").
		Preload("District.Subdistrict").
		Find(&provinces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, provinces)
}