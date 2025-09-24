package controller

import (
	"encoding/hex"
	"fmt"
	"landchain/config"
	"landchain/entity"
	"net/http"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
)

// GetDataUserVerification ดึงข้อมูล user_verification ของผู้ใช้จาก JWT
func GetDataUserVerification(c *gin.Context) {
	userid := c.Param("userid")
	if userid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userid is required"})
		return
	}

	db := config.DB()

	var user entity.Users
	if err := db.Where("id = ?", userid).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if user.UserVerificationID == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user_verification not linked to user"})
		return
	}

	var userVerification entity.UserVerification
	if err := db.Where("id = ?", user.UserVerificationID).First(&userVerification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user_verification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"wallet":    userVerification.Wallet,
		"signature": userVerification.Signature,
		"nameHash":  userVerification.NameHashSalt,
	})
}

func CheckVerify(c *gin.Context) {
	// 1️⃣ ดึง wallet จาก context (JWT หรือ session) แล้วแปลงเป็น lowercase
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"verified": false,
			"reason":   "Wallet not found in token",
		})
		return
	}
	walletStr := strings.ToLower(walletAddr.(string))
	wallet := common.HexToAddress(walletStr)
	fmt.Println("[DEBUG] Wallet from token:", walletStr)

	// 2️⃣ ดึง user verification จาก DB โดยใช้ lowercase
	db := config.DB()
	var user entity.UserVerification
	if err := db.Where("wallet = ? AND status_onchain = true", walletStr).First(&user).Error; err != nil {
		fmt.Println("[ERROR] DB user not found:", err)
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   fmt.Sprintf("User record not found or not verified on-chain: %v", err),
		})
		return
	}
	fmt.Println("[DEBUG] Found DB user:", user)

	if user.NameHashSalt == "" {
		fmt.Println("[ERROR] NameHash not set in DB")
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "NameHash not set in database",
		})
		return
	}

	// 3️⃣ ดึง owner info จาก smart contract
	out, err := ContractInstance.Owners(wallet)
	if err != nil {
		fmt.Println("[ERROR] Failed to fetch owner from contract:", err)
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   fmt.Sprintf("Cannot fetch owner from smart contract: %v", err),
		})
		return
	}
	fmt.Println("[DEBUG] On-chain owner fetched:", out)

	// 4️⃣ แปลง NameHash ของ DB จาก hex string เป็น [32]byte
	// 4️⃣ แปลง NameHash ของ DB จาก hex string เป็น [32]byte
	var dbNameHash [32]byte
	cleanedNameHash := strings.TrimSpace(user.NameHashSalt)     // ลบช่องว่างและ newline
	cleanedNameHash = strings.TrimPrefix(cleanedNameHash, "0x") // ลบ prefix 0x ถ้ามี

	nameHashBytes, err := hex.DecodeString(cleanedNameHash)
	if err != nil {
		fmt.Println("[ERROR] Failed to decode NameHashSalt:", err)
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "Invalid NameHashSalt in DB",
		})
		return
	}
	copy(dbNameHash[:], nameHashBytes)

	// 5️⃣ ตรวจสอบ wallet และ NameHash (เปรียบเทียบ lowercase)
	onchainWalletStr := strings.ToLower(out.Wallet.Hex())
	if onchainWalletStr != walletStr {
		fmt.Println("[ERROR] Wallet mismatch. On-chain:", onchainWalletStr, "DB:", walletStr)
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "Wallet does not match on-chain owner",
		})
		return
	}

	if out.NameHash != dbNameHash {
		fmt.Println("[ERROR] NameHash mismatch. On-chain:", out.NameHash, "DB:", dbNameHash)
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "NameHash does not match on-chain",
		})
		return
	}

	// 6️⃣ ถ้า wallet และ NameHash ตรงกัน
	fmt.Println("[SUCCESS] Wallet and NameHash verified successfully")
	c.JSON(http.StatusOK, gin.H{
		"verified": true,
	})
}
