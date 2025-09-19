package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ดึงจังหวัดทั้งหมด
func GetProvince(c *gin.Context) {
	var provinces []entity.Province
	if err := config.DB().Find(&provinces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve provinces"})
		return
	}
	c.JSON(http.StatusOK, provinces)
}

// ดึงจังหวัดทั้งหมดสำหรับ Appointment Status (เฉพาะชื่อจังหวัด)
func GetProvincesForFilter(c *gin.Context) {
	var provinces []entity.Province
	if err := config.DB().Find(&provinces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve provinces"})
		return
	}

	// Transform data เพื่อให้ตรงกับ Frontend interface
	var result []map[string]interface{}
	for _, province := range provinces {
		result = append(result, map[string]interface{}{
			"ID":       province.ID,
			"province": province.Province,
		})
	}

	c.JSON(http.StatusOK, result)
}

// ดึงจังหวัดตาม ID
func GetProvinceByID(c *gin.Context) {
	provinceIDStr := c.Param("provinceID")

	provinceID, err := strconv.ParseUint(provinceIDStr, 10, 64)
	if err != nil || provinceID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid provinceID"})
		return
	}

	var province entity.Province
	if err := config.DB().First(&province, provinceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Province not found"})
		return
	}

	c.JSON(http.StatusOK, province)
}

// ดึงจังหวัดพร้อมสาขา
func GetProvinceWithBranches(c *gin.Context) {
	provinceIDStr := c.Param("provinceID")

	provinceID, err := strconv.ParseUint(provinceIDStr, 10, 64)
	if err != nil || provinceID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid provinceID"})
		return
	}

	var province entity.Province
	if err := config.DB().Preload("Branch").First(&province, provinceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Province not found"})
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
