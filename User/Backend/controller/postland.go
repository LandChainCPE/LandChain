package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
	db := config.DB()
	var postlands []entity.Landsalepost

	err := db.
		Preload("Province", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th") // เร็วและเล็กลง
		}).
		Preload("District", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "province_id")
		}).
		Preload("Subdistrict", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "district_id")
		}).
		Preload("Tag").
		Preload("Landtitle"). // << ถ้าต้องใช้โฉนด
		Preload("Roomchat").
		Preload("Transaction").
		Preload("Photoland").
		Find(&postlands).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโพสต์ขายที่ดินได้"})
		return
	}
	c.JSON(http.StatusOK, postlands)
}

