package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"github.com/gin-gonic/gin"
)

// CreateLandPost สร้างข้อมูลโพสต์การขายที่ดิน
func CreateLandPost(c *gin.Context) {
	var postland entity.Landsalepost

	// Bind the incoming JSON data to the postland object
	if err := c.ShouldBindJSON(&postland); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถอ่านข้อมูลได้"})
		return
	}

	// Save the postland to the database
	if err := config.DB().Create(&postland).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลโพสต์การขายที่ดิน"})
		return
	}

	// Send a success response
	c.JSON(http.StatusOK, gin.H{"message": "บันทึกข้อมูลโพสต์การขายที่ดินสำเร็จ"})
}

// GetAllPostLandData ดึงข้อมูลการขายที่ดินทั้งหมด พร้อมข้อมูลโฉนดที่ดิน (Landtitle)
func GetAllPostLandData(c *gin.Context) {
	// Get DB connection
	db := config.DB()

	// Declare a variable to hold the fetched data
	var postlands []entity.Landsalepost

	// Fetch all postlands, optionally preload related data
	if err := db.Preload("Province").Preload("District").Preload("Subdistrict").Preload("Tag").Preload("Roomchat").Preload("Transaction").Preload("Photoland").Find(&postlands).Error; err != nil {
		// If there is an error fetching data, return a 500 response
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโพสต์ขายที่ดินได้"})
		return
	}

	// Send the data as a JSON response
	c.JSON(http.StatusOK, postlands)
}
