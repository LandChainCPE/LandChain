package controller

import (
	"landchain/config"
	"landchain/entity"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"landchain/services" // ใช้ service สำหรับการสร้าง JWT Token
)

// CreateAccount ฟังก์ชั่นสำหรับสร้างบัญชีผู้ใช้
func CreateAccount(c *gin.Context) {
	// สร้างตัวแปรสำหรับเก็บข้อมูลผู้ใช้ที่รับจาก frontend
	var user entity.Users

	// อ่านข้อมูลที่ส่งมาจาก body ของ request
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input",
		})
		return
	}

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ตรวจสอบว่ามีผู้ใช้อยู่ในฐานข้อมูลหรือไม่ (ตรวจสอบจาก Email หรือเบอร์โทร)
	var existingUser entity.Users
	if err := db.Where("email = ? OR phonenumber = ? OR metamaskaddress = ?", user.Email, user.Phonenumber, user.Metamaskaddress).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "User with this email, phone number, or wallet address already exists",
		})
		return
	}

	// กำหนด RoleID (สมมติว่า 1 เป็นค่าของ Role สำหรับผู้ใช้ทั่วไป)
	user.RoleID = 1 // แก้ไขเป็น RoleID ที่ต้องการ หรือสามารถรับจาก frontend ได้

	// บันทึกข้อมูลผู้ใช้ลงในฐานข้อมูล
	if err := db.Create(&user).Error; err != nil {
		log.Println("Error details:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error creating user",
		})
		return
	}

	// สร้าง JWT Token สำหรับผู้ใช้ที่เพิ่งสมัคร
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "RhE9Q6zyV8Ai5jnPq2ZDsXMmLuy5eNkw", // คุณสามารถใช้ key ของคุณเอง
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(user.Email) // ใช้ Email หรือข้อมูลที่เหมาะสมในการสร้าง Token
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error signing token"})
		return
	}

	// ส่งข้อมูลที่สร้างแล้วกลับไปพร้อมกับ Token
	c.JSON(http.StatusOK, gin.H{
		"message":       "User created successfully",
		"token_type":    "Bearer",
		"token":         signedToken,
		"FirstNameUser": user.Firstname,
		"LastNameUser":  user.Lastname,
	})
}

// CheckWallet ฟังก์ชันสำหรับตรวจสอบว่า Wallet ID มีในฐานข้อมูลหรือไม่
func CheckWallet(c *gin.Context) {
	var request struct {
		WalletId string `json:"walletId"`
	}

	// รับข้อมูลจาก Body ของ request
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ตรวจสอบว่า Wallet ID นี้มีในฐานข้อมูลหรือไม่
	var user entity.Users
	if err := db.Where("metamaskaddress = ?", request.WalletId).First(&user).Error; err == nil {
		// ถ้ามีผู้ใช้ในระบบแล้ว
		c.JSON(http.StatusOK, gin.H{"exists": true})
	} else {
		// ถ้าไม่มีผู้ใช้ในระบบ
		c.JSON(http.StatusOK, gin.H{"exists": false})
	}
}
