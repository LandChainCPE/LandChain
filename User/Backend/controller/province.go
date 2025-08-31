package controller

import (
	"net/http"
	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"

)

func GetProvince(c *gin.Context) {
	var province []entity.Province
	if err := config.DB().Find(&province).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bookings"})
		return
	}
	c.JSON(http.StatusOK, province)
}

// ฟังก์ชันดึงข้อมูลจังหวัดจากไฟล์ CSV
// func GetAllProvinces(c *gin.Context) {
// 	var provinces []entity.Province

// 	// Use the DB instance that was configured in config package to fetch all provinces
// 	if err := config.DB().Find(&provinces).Error; err != nil {
// 		// If an error occurs while fetching data, respond with an error message
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลจังหวัดได้"})
// 		return
// 	}

// 	// If data is fetched successfully, return the list of provinces with a status code 200 (OK)
// 	c.JSON(http.StatusOK, provinces)
// }


