package controller

import (
	"encoding/hex"
	"landchain/config"
	"landchain/entity"
	"math/rand"
	"net/http"
	"strings"

	"golang.org/x/crypto/sha3"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
	// ถ้ายังไม่ได้ใช้ godotenv ให้ import ด้วย
	// "github.com/joho/godotenv"
)

// randomString สุ่ม string ที่มีทั้งตัวอักษรและตัวเลข ความยาว n ตัว
func randomString(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

// GetBookings ดึงข้อมูลการจองทั้งหมดพร้อมชื่อผู้ใช้และเวลา
func GetBookingData(c *gin.Context) {
	db := config.DB()

	var bookings []entity.Booking
	if err := db.Preload("Users").Preload("Time").Preload("ServiceType").Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// แปลงข้อมูลสำหรับ Frontend
	var result []gin.H
	for _, b := range bookings {
		result = append(result, gin.H{
			"id":           b.ID,
			"date_booking": b.DateBooking,
			"firstname":    b.Users.Firstname,
			"lastname":     b.Users.Lastname,
			"time_slot":    b.Time.Timework,
			"service_type": b.ServiceType.Service, // เพิ่มข้อมูล ServiceType
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

func GetDataUserForVerify(c *gin.Context) {
	// ดึง bookingID จากพารามิเตอร์
	bookingID := c.Param("bookingID")

	var booking entity.Booking
	// ใช้ Preload เพื่อดึงข้อมูลที่เชื่อมโยงมา
	if err := config.DB().
		Preload("Users").       // ดึงข้อมูลผู้ใช้
		Preload("ServiceType"). // ดึงข้อมูลประเภทบริการ
		First(&booking, bookingID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลการจองกลับไป
	c.JSON(http.StatusOK, gin.H{
		"firstname":    booking.Users.Firstname,
		"lastname":     booking.Users.Lastname,
		"wallet_id":    booking.Users.Metamaskaddress,
		"service_type": booking.ServiceType.Service,
	})
}

func VerifyWalletID(c *gin.Context) {
	useTestData := true

	var (
		walletID string
		name     string
		salt     string
	)

	if useTestData {
		walletID = "0x81C7a15aE0b72CADE82D428844cff477f6E364b5"
		name = "Rattapon Phonthaisong"
		salt = "klPtTue58Y1FcIC"
	}

	// 1. nameHash = keccak256(name + salt) (sha3.NewLegacyKeccak256)
	nameSalt := []byte(name + salt)
	hash := sha3.NewLegacyKeccak256()
	hash.Write(nameSalt)
	nameHash := hash.Sum(nil) // []byte 32 bytes

	// 2. solidityPacked(["address", "bytes32"], [walletID, nameHash])
	addr := strings.TrimPrefix(walletID, "0x")
	addrBytes, _ := hex.DecodeString(addr)   // 20 bytes
	packed := append(addrBytes, nameHash...) // 52 bytes

	// 3. messageHash = keccak256(packed)
	hash2 := sha3.NewLegacyKeccak256()
	hash2.Write(packed)
	messageHash := hash2.Sum(nil) // []byte 32 bytes

	// 4. prefix + messageHash (เหมือน ethers.js signMessage)
	prefix := []byte("\x19Ethereum Signed Message:\n32")
	msg := append(prefix, messageHash...)

	// 5. hash อีกที (keccak256)
	finalHash := crypto.Keccak256(msg)

	// 6. sign hash นี้
	privateKeyHex := "11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d"
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid private key"})
		return
	}
	signature, err := crypto.Sign(finalHash, privateKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign"})
		return
	}

	// go-ethereum คืน v เป็น 0/1 แต่ ethers.js ให้เป็น 27/28 -> ด้วยการบวก 27
	if len(signature) == 65 {
		signature[64] += 27
	}

	sigHex := hexutil.Encode(signature)

	c.JSON(http.StatusOK, gin.H{
		"wallet":    walletID,
		"nameHash":  "0x" + hex.EncodeToString(nameHash),
		"signature": sigHex,
		"salt":      salt,
	})
}
