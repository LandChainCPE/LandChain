package controller

import (
	"crypto/rand"
	"fmt"
	"landchain/config"
	"landchain/entity"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func generateNonce() string {
	// ใช้ nanosecond + random bytes เพื่อความ unique สูง
	timestamp := time.Now().UnixNano()
	randomBytes := make([]byte, 16)
	rand.Read(randomBytes)

	return fmt.Sprintf("LandChain-Login-%d-%x", timestamp, randomBytes)
} // GET /nonce/:address
func GetNonce(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "address required"})
		return
	}


	db := config.DB()


	db.Where("address = ? AND expires_at < ?", address, time.Now()).Delete(&entity.Nonce{})  // ทำการเช็คตารางของ Address คนนั้น เช็คว่าNonceมันหมดอายุยัง  ถ้าหมดอายุก็ลบ 


	var existingCount int64
	db.Model(&entity.Nonce{}).Where("address = ? AND expires_at > ?",
		address, time.Now()).Count(&existingCount)     //ทำการนับ ว่า wallet นี้ กับ Nonce ที่ยังไม่หทดอายุมีกี่ตัว


	if existingCount >= 5 {     // ถ้า Nonce เกิน 5 ก็ส่ง Error ไป
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error": "Too many pending login attempts. Please wait or try again later."})
		return
	}

 	// เพื่อป้องกันการเขียนลง DB ซ้ำๆ เกินไป

	// ถ้าไท่เข้าเงื่่อนไขก็ สร้าง nonce ใหม่
	nonce := generateNonce()
	nonceRecord := entity.Nonce{
		Address:   address,
		Nonce:     nonce,
		ExpiresAt: time.Now().Add(5 * time.Minute), // หมดอายุใน 5 นาที
	}

	// บันทึก Nonce ลงฐานข้อมูล
	if err := db.Create(&nonceRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create nonce"})
		return
	}

	// ส่ง Nonce กลับไป
	c.JSON(http.StatusOK, gin.H{"nonce": nonce})
}

// ตรวจสอบว่า มี Nonce และยังไม่หมดอายุ  
func ValidateAndConsumeNonce(address, nonce string) bool {
	db := config.DB()

	var nonceRecord entity.Nonce
	err := db.Where("address = ? AND nonce = ? AND expires_at > ?",
		address, nonce, time.Now()).First(&nonceRecord).Error

	if err != nil {
		return false // nonce ไม่ถูกต้องหรือหมดอายุ
	}

	// ลบ nonce ที่ใช้แล้ว (consume)
	db.Delete(&nonceRecord)
	return true
}

// POST /nonce/validate
// Body: {"address": "...", "nonce": "..."}
func ValidateNonce(c *gin.Context) {
	var req struct {
		Address string `json:"address"`
		Nonce   string `json:"nonce"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// ใช้ ValidateAndConsumeNonce function
	if ValidateAndConsumeNonce(req.Address, req.Nonce) {
		c.JSON(http.StatusOK, gin.H{"success": true})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired nonce"})
	}
}
