package controller

import (
	"net/http"
	"log"
	"github.com/gin-gonic/gin"
	"landchain/config"
	"landchain/entity"
)

// API สำหรับรับข้อมูล Public Key และ Name และบันทึกลงในฐานข้อมูล
func SavePublicKey(c *gin.Context) {
	var input struct {
		Name      string `json:"name"`
		Publickey string `json:"publicKey"`
	}

	// รับข้อมูลจาก request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่า name และ publicKey ไม่เป็นค่าว่าง
	if input.Name == "" || input.Publickey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name or Public Key is missing"})
		return
	}

	// สร้างผู้ใช้ใหม่ในฐานข้อมูลพร้อม Public Key
	user := entity.Users{
		Firstname: input.Name,
		Publickey: input.Publickey,
	}

	// บันทึกข้อมูลลงในฐานข้อมูล
	if err := config.DB().Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log ข้อมูลและตอบกลับว่า Public Key ถูกบันทึกสำเร็จ
	log.Printf("Public Key saved for user: %s", input.Name)
	c.JSON(http.StatusOK, gin.H{"message": "Public Key saved successfully", "user": user})
}
