package controller

import (
	"encoding/hex"
	"fmt"
	"landchain/config"
	"landchain/entity"
	"net/http"
	"os"
	"strings"

	"landchain/services"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
)

// LoginRequest struct for receiving login data with nonce and signature
type LoginRequest struct {
	Address   string `json:"address" binding:"required"`
	Nonce     string `json:"nonce" binding:"required"`
	Signature string `json:"signature" binding:"required"`
}

// verifySignature verifies that the signature was created by the address owner
func verifySignature(address, message, signature string) bool {
	fmt.Printf("🔍 Debug - Address: %s\n", address)
	fmt.Printf("🔍 Debug - Message: %s\n", message)
	fmt.Printf("🔍 Debug - Signature: %s\n", signature)

	// Remove 0x prefix if present
	signature = strings.TrimPrefix(signature, "0x")
	address = strings.TrimPrefix(address, "0x")

	// Decode signature
	sigBytes, err := hex.DecodeString(signature)
	if err != nil {
		fmt.Printf("❌ Signature decode error: %v\n", err)
		return false
	}

	// The signature should be 65 bytes (32 + 32 + 1)
	if len(sigBytes) != 65 {
		fmt.Printf("❌ Invalid signature length: %d (expected 65)\n", len(sigBytes))
		return false
	}

	// Ethereum signatures have recovery ID as the last byte
	// but go-ethereum expects it to be 0 or 1, not 27 or 28
	if sigBytes[64] >= 27 {
		sigBytes[64] -= 27
	}

	// Create the message hash that was signed
	// Use accounts.TextHash for proper Ethereum signed message format
	hash := accounts.TextHash([]byte(message))
	fmt.Printf("🔍 Debug - TextHash: %x\n", hash)

	// Recover the public key from signature
	pubKey, err := crypto.SigToPub(hash, sigBytes)
	if err != nil {
		fmt.Printf("❌ Signature recovery error: %v\n", err)
		return false
	}

	// Get address from public key
	recoveredAddr := crypto.PubkeyToAddress(*pubKey)
	fmt.Printf("🔍 Debug - Expected: 0x%s\n", address)
	fmt.Printf("🔍 Debug - Recovered: %s\n", recoveredAddr.Hex())

	// Compare addresses (case insensitive)
	result := strings.EqualFold(recoveredAddr.Hex(), "0x"+address)
	fmt.Printf("🔍 Debug - Verification result: %v\n", result)
	return result
}

// LoginUser ฟังก์ชั่นสำหรับการ Login โดยใช้ Metamask Wallet Address พร้อม nonce verification
func LoginUser(c *gin.Context) {
	// รับข้อมูลจาก frontend (Address, Nonce, Signature)
	var loginReq LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	// ตรวจสอบและใช้ nonce
	if !ValidateAndConsumeNonce(loginReq.Address, loginReq.Nonce) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired nonce"})
		return
	}

	// ตรวจสอบ signature
	if !verifySignature(loginReq.Address, loginReq.Nonce, loginReq.Signature) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
		return
	}

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ค้นหาผู้ใช้ในฐานข้อมูลจาก Wallet Address (Metamask Address)
	var existingUser entity.Users
	if err := db.Where("metamaskaddress = ?", loginReq.Address).First(&existingUser).Error; err != nil {
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
		"user_id":        existingUser.ID,
		"first_name":     existingUser.Firstname,
		"last_name":      existingUser.Lastname,
		"wallet_address": existingUser.Metamaskaddress,
		"success":        true,
		"exists":         true,
	})
}

func RegisterUser(c *gin.Context) {
	// รับข้อมูลจาก frontend (Address, Nonce, Signature, Firstname, Lastname, Phonenumber, Email)
	var req struct {
		Address     string `json:"address" binding:"required"`
		Nonce       string `json:"nonce" binding:"required"`
		Signature   string `json:"signature" binding:"required"`
		Firstname   string `json:"firstname"`
		Lastname    string `json:"lastname"`
		Phonenumber string `json:"phonenumber"`
		Email       string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	// ตรวจสอบและใช้ nonce
	if !ValidateAndConsumeNonce(req.Address, req.Nonce) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired nonce"})
		return
	}

	// ตรวจสอบ signature
	if !verifySignature(req.Address, req.Nonce, req.Signature) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
		return
	}

	db := config.DB()

	// เช็คว่า Metamask ไม่ซ้ำกับในฐานข้อมูล
	var existingUser entity.Users
	if err := db.Where("metamaskaddress = ?", req.Address).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Wallet address already exists"})
		return
	}

	// สร้างข้อมูล User ใหม่
	newUser := entity.Users{
		Metamaskaddress: req.Address,
		Firstname:       req.Firstname,
		Lastname:        req.Lastname,
		Phonenumber:     req.Phonenumber,
		Email:           req.Email,
		RoleID:          1, // ผู้ใช้ทั่วไป
	}
	if err := db.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
		return
	}

	// สร้าง JWT Token สำหรับผู้ใช้
	jwtWrapper := services.JwtWrapper{
		SecretKey:       os.Getenv("JWT_SECRET"),
		Issuer:          os.Getenv("JWT_ISSUER"),
		ExpirationHours: 1,
	}

	signedToken, err := jwtWrapper.GenerateToken(newUser.Metamaskaddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error signing token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "User registered successfully",
		"token_type":     "Bearer",
		"token":          signedToken,
		"user_id":        newUser.ID,
		"first_name":     newUser.Firstname,
		"last_name":      newUser.Lastname,
		"wallet_address": newUser.Metamaskaddress,
		"success":        true,
		"exists":         true,
	})
}
