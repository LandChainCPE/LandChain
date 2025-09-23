package controller

import (
	"fmt"
	"landchain/config"
	"landchain/entity"
	"net/http"

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
	// 1️⃣ ดึง wallet จาก context (JWT หรือ session)
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"verified": false,
			"reason":   "Wallet not found in token",
		})
		return
	}
	wallet := common.HexToAddress(walletAddr.(string))

	// 2️⃣ ดึง user verification จาก DB
	db := config.DB()
	var user entity.UserVerification
	if err := db.Where("wallet = ? AND status_onchain = false", wallet).First(&user).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "User record not found or not verified on-chain",
		})
		return
	}

	if user.NameHashSalt == "" {
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "NameHash not set in database",
		})
		return
	}

	// 3️⃣ ดึง owner info จาก smart contract
	out, err := ContractInstance.Owners(wallet)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   fmt.Sprintf("Cannot fetch owner from smart contract: %v", err),
		})
		return
	}

	// 4️⃣ แปลง NameHash ของ DB เป็น [32]byte เพื่อเทียบ
	var dbNameHash [32]byte
	copy(dbNameHash[:], user.NameHashSalt) // สมมติ user.NameHash เป็น []byte ขนาด 32

	// 5️⃣ ตรวจสอบ wallet และ nameHash
	if out.Wallet != wallet {
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "Wallet does not match on-chain owner",
		})
		return
	}

	if out.NameHash != dbNameHash {
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "NameHash does not match on-chain",
		})
		return
	}

	// 6️⃣ ถ้า wallet และ nameHash ตรงกัน
	c.JSON(http.StatusOK, gin.H{
		"verified": true,
	})
}
