package controller

import (
	"landchain/config"
	"landchain/entity"
	"log"
	"net/http"

	"landchain/services" // ใช้ service สำหรับการสร้าง JWT Token

	"github.com/gin-gonic/gin"
)

// CreateAccount ฟังก์ชั่นสำหรับสร้างบัญชีผู้ใช้
func CreateAccount(c *gin.Context) {
	var user entity.Users
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()

	// ตรวจสอบการมีอยู่ของผู้ใช้ในฐานข้อมูล
	var existingUser entity.Users
	if err := db.Where("email = ? OR phonenumber = ? OR metamaskaddress = ?", user.Email, user.Phonenumber, user.Metamaskaddress).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email, phone number, or wallet address already exists"})
		return
	}

	user.RoleID = 1 // ค่า RoleID สำหรับผู้ใช้ทั่วไป

	// บันทึกข้อมูลผู้ใช้
	if err := db.Create(&user).Error; err != nil {
		log.Println("Error details:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
		return
	}

	// สร้าง JWT Token
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "RhE9Q6zyV8Ai5jnPq2ZDsXMmLuy5eNkw",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(user.Metamaskaddress)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error signing token"})
		return
	}

	// ส่งข้อมูลกลับ
	c.JSON(http.StatusOK, gin.H{
		"message":       "User created successfully",
		"token_type":    "Bearer",
		"token":         signedToken,
		"user_id":       user.ID,
		"FirstNameUser": user.Firstname,
		"LastNameUser":  user.Lastname,
	})
}

// CheckWallet ฟังก์ชันสำหรับตรวจสอบว่า Wallet ID มีในฐานข้อมูลหรือไม่
func CheckWallet(c *gin.Context) {
	var request struct {
		WalletAddress string `json:"walletAddress"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()

	var user entity.Users
	if err := db.Where("metamaskaddress = ?", request.WalletAddress).First(&user).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"exists": true})
	} else {
		c.JSON(http.StatusOK, gin.H{"exists": false})
	}
}

// GetUserByID ดึงข้อมูล User ตาม userId
func GetUserinfoByID(c *gin.Context) {
    userId := c.Param("userId")
    db := config.DB()
    var user entity.Users
    // ดึง user จาก database ตาม userId
    if err := db.First(&user, userId).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "id": user.ID,
        "firstName": user.Firstname,
        "lastName": user.Lastname,
        "email": user.Email,
        "user_verification_id": user.UserVerificationID,
        "wallet_address": user.Metamaskaddress,
    })
}

// // LoginUser ฟังก์ชั่นสำหรับการ Login โดยใช้ Metamask Wallet Address
// func LoginUser(c *gin.Context) {
// 	var user entity.Users
// 	if err := c.ShouldBindJSON(&user); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
// 		return
// 	}

// 	db := config.DB()

// 	var existingUser entity.Users
// 	if err := db.Where("metamaskaddress = ?", user.Metamaskaddress).First(&existingUser).Error; err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
// 		return
// 	}

// 	jwtWrapper := services.JwtWrapper{
// 		SecretKey:       "RhE9Q6zyV8Ai5jnPq2ZDsXMmLuy5eNkw",
// 		Issuer:          "LandChainAuth",
// 		ExpirationHours: 24,
// 	}

// 	signedToken, err := jwtWrapper.GenerateToken(existingUser.Metamaskaddress)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error signing token"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message":        "User logged in successfully",
// 		"token_type":     "Bearer",
// 		"token":          signedToken,
// 		"first_name":     existingUser.Firstname,
// 		"last_name":      existingUser.Lastname,
// 		"wallet_address": existingUser.Metamaskaddress,
// 	})
// }
