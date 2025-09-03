package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"os"

	"landchain/services"

	"github.com/gin-gonic/gin"
)

// LoginUser ฟังก์ชั่นสำหรับการ Login โดยใช้ Metamask Wallet Address
func LoginUser(c *gin.Context) {
	// รับข้อมูลจาก frontend (Wallet Address)
	var user entity.Users
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ค้นหาผู้ใช้ในฐานข้อมูลจาก Wallet Address (Metamask Address)
	var existingUser entity.Users
	if err := db.Where("metamaskaddress = ?", user.Metamaskaddress).First(&existingUser).Error; err != nil {
		// หากไม่พบผู้ใช้ในระบบ ให้แจ้งว่าไม่พบผู้ใช้
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// สร้าง JWT Token สำหรับผู้ใช้
	jwtWrapper := services.JwtWrapper{
		SecretKey:       os.Getenv("JWT_SECRET"), // ใช้ key ของคุณเอง
		Issuer:          os.Getenv("JWT_ISSUER"),
		ExpirationHours: 1,
	}

	// สร้าง Token โดยใช้ Metamask Wallet Address
	signedToken, err := jwtWrapper.GenerateToken(existingUser.Metamaskaddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error signing token"})
		return
	}

	// ส่งข้อมูลผู้ใช้และ JWT Token กลับไปที่ frontend
	c.JSON(http.StatusOK, gin.H{
		"message":        "User logged in successfully",
		"token_type":     "Bearer",
		"token":          signedToken,
		"first_name":     existingUser.Firstname,
		"last_name":      existingUser.Lastname,
		"wallet_address": existingUser.Metamaskaddress,
	})
}
