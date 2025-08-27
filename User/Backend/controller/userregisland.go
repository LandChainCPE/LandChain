package controller

import (
	"landchain/config"
	"landchain/entity"
	"log"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// RegisterLand บันทึกข้อมูลที่ดิน
func RegisterLand(c *gin.Context) {
	db := config.DB()

	// รับค่า form-data
	var land entity.Landtitle 
	if err := c.ShouldBind(&land); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// จัดการรูปภาพถ้ามี
	file, err := c.FormFile("image")
	if err == nil {
		// ตั้งชื่อไฟล์ใหม่เพื่อไม่ให้ซ้ำ
		filename := filepath.Base(file.Filename)
		savePath := "./uploads/" + filename

		// บันทึกไฟล์ไปที่โฟลเดอร์ uploads
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		land.ImagePath = savePath // เก็บ path ของรูปในฐานข้อมูล
	}

	// บันทึกข้อมูลที่ดิน
	if err := db.Create(&land).Error; err != nil {
		log.Println("Error creating land:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create land"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Land data created successfully",
		"land":    land,
	})
}
