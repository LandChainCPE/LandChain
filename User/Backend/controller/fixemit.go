package controller

import (
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"

	"landchain/config"
	"landchain/entity"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
)

func CheckUserVerificationUpdate(c *gin.Context) {
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"verified": false,
			"reason":   "Wallet not found in token",
		})
		return
	}
	walletStr := strings.ToLower(walletAddr.(string)) //ตัวนี้ไว้เทียบ Database
	wallet := common.HexToAddress(walletStr)          //ตัวนี้โยน ให้ Smartconntract

	db := config.DB()
	var user entity.UserVerification
	if err := db.Where("wallet = ?", walletStr).First(&user).Error; err != nil {
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

	//โยน Wallet ไปเช็ต NameHash จาก Smartcontract
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

	// 5️⃣ ตรวจสอบ wallet และ NameHash (เปรียบเทียบ lowercase)    เช็ค Wallet
	onchainWalletStr := strings.ToLower(out.Wallet.Hex())
	if onchainWalletStr != walletStr {
		fmt.Println("[ERROR] Wallet mismatch. On-chain:", onchainWalletStr, "DB:", walletStr)
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "Wallet does not match on-chain owner",
		})
		return
	}
	//เช็ค NameHash
	if out.NameHash != dbNameHash {
		fmt.Println("[ERROR] NameHash mismatch. On-chain:", out.NameHash, "DB:", dbNameHash)
		c.JSON(http.StatusOK, gin.H{
			"verified": false,
			"reason":   "NameHash does not match on-chain",
		})
		return
	}

	// อัพเดต Status_onchain = true ใน DB
	user.Status_onchain = true
	if err := db.Save(&user).Error; err != nil {
		fmt.Println("[ERROR] Failed to update Status_onchain:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"verified": false,
			"reason":   "Failed to update Status_onchain in database",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"verified": true,
		"reason":   "User verified and Status_onchain updated555",
	})
	return

}
