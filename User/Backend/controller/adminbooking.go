package controller

import (
	"encoding/hex"
	"fmt"
	"landchain/config"
	"landchain/entity"
	"math/rand"
	"net/http"
	"strings"

	"golang.org/x/crypto/sha3"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	// รับ bookingID จาก path param
	bookingID := c.Param("bookingID")

	// เริ่ม transaction
	tx := config.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	// หากไม่ commit ท้ายที่สุดจะ rollback
	defer tx.Rollback()

	// ดึง booking พร้อม user
	var booking entity.Booking
	if err := tx.Preload("Users").First(&booking, bookingID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "booking not found: " + err.Error()})
		return
	}

	// ตรวจสอบข้อมูลผู้ใช้
	if booking.Users.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "booking has no user"})
		return
	}
	walletID := strings.TrimSpace(booking.Users.Metamaskaddress)
	if walletID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user has no metamask address"})
		return
	}
	name := strings.TrimSpace(booking.Users.Firstname + " " + booking.Users.Lastname)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user has no name"})
		return
	}

	// สร้าง random salt
	salt := randomString(16)

	// 1. nameHash = keccak256(name + salt)
	nameSalt := []byte(name + salt)
	h := sha3.NewLegacyKeccak256()
	h.Write(nameSalt)
	nameHash := h.Sum(nil)

	// 2. solidityPacked(["address", "bytes32"], [walletID, nameHash])
	addr := strings.TrimPrefix(walletID, "0x")
	addrBytes, err := hex.DecodeString(addr)
	if err != nil || len(addrBytes) != 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid wallet address"})
		return
	}
	packed := append(addrBytes, nameHash...)

	// 3. messageHash = keccak256(packed)
	h2 := sha3.NewLegacyKeccak256()
	h2.Write(packed)
	messageHash := h2.Sum(nil)

	// 4. prefix + messageHash (เหมือน ethers.js signMessage)
	prefix := []byte("\x19Ethereum Signed Message:\n32")
	msg := append(prefix, messageHash...)

	// 5. hash อีกที (keccak256)
	finalHash := crypto.Keccak256(msg)

	// 6. sign hash นี้ ด้วย private key ของเซิร์ฟเวอร์ (ตัวอย่าง)
	privateKeyHex := "11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d"
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid server private key"})
		return
	}
	signature, err := crypto.Sign(finalHash, privateKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign"})
		return
	}
	if len(signature) == 65 {
		signature[64] += 27
	}
	sigHex := hexutil.Encode(signature)

	// สร้าง UserVerification แต่ยังไม่ commit นอก transaction
	uv := entity.UserVerification{
		Wallet:         walletID,
		NameHashSalt:   "0x" + hex.EncodeToString(nameHash),
		Signature:      sigHex,
		Status_onchain: false,
		RandomSalt:     salt,
	}
	if err := tx.Create(&uv).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user_verification: " + err.Error()})
		return
	}

	// อัพเดต Users.UserVerificationID ให้ชี้ไปยังเรคคอร์ดที่สร้างขึ้น
	if err := tx.Model(&booking.Users).Update("user_verification_id", uv.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user with verification id: " + err.Error()})
		return
	}

	// commit เมื่อทุกอย่างสำเร็จ
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit transaction: " + err.Error()})
		return
	}

	// ส่งผลลัพธ์กลับ
	c.JSON(http.StatusOK, gin.H{
		"wallet":              walletID,
		"nameHash":            "0x" + hex.EncodeToString(nameHash),
		"signature":           sigHex,
		"salt":                salt,
		"user_verificationID": uv.ID,
	})
}

func VerifyLandtitleID(c *gin.Context) {
	// รับ LandtitleID จาก path param
	landtitleID := c.Param("LandtitleID")

	db := config.DB()
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	defer tx.Rollback()

	// ดึงข้อมูล Landtitle พร้อม User, Subdistrict, District, Province
	var land entity.Landtitle
	if err := tx.Preload("User").Preload("Subdistrict").Preload("District").Preload("Province").First(&land, landtitleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Landtitle not found"})
		return
	}

	// Gen UUID ใหม่ ถ้า UUID ซ้ำในฐานข้อมูล ให้ gen ใหม่จนกว่าจะไม่ซ้ำ
	var uuidStr string
	for {
		uuidStr = uuid.New().String()
		var count int64
		tx.Model(&entity.Landtitle{}).Where("uuid = ?", uuidStr).Count(&count)
		if count == 0 {
			break
		}
	}

	// เตรียมข้อมูล metaFields ตามรูปแบบ JS
	metaFields := "SurveyNumber:" + land.SurveyNumber +
		", LandNumber:" + land.LandNumber +
		", SurveyPage:" + land.SurveyPage +
		", TitleDeedNumber:" + land.TitleDeedNumber +
		", Volume:" + land.Volume +
		", Page:" + land.Page +
		", Rai:" + fmt.Sprint(land.Rai) +
		", Ngan:" + fmt.Sprint(land.Ngan) +
		", SqWa:" + fmt.Sprint(land.SquareWa) +
		", Subdistrict:" + land.District.NameTH +
		", District:" + land.District.NameTH +
		", Province:" + land.Province.NameTh +
		", UUID:" + uuidStr

	walletID := land.User.Metamaskaddress
	if walletID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has no wallet address"})
		return
	}

	// สร้าง hash สำหรับเซ็น (wallet + metaFields)
	packed := append(
		common.Hex2Bytes(strings.TrimPrefix(walletID, "0x")),
		[]byte(metaFields)...,
	)
	hash := crypto.Keccak256Hash(packed)

	// เติม prefix แบบเดียวกับ smart contract
	prefix := []byte("\x19Ethereum Signed Message:\n32")
	msg := append(prefix, hash.Bytes()...)
	ethHash := crypto.Keccak256Hash(msg)

	// เซ็น hash ด้วย private key ของระบบ
	privateKeyHex := "11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d"
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid server private key"})
		return
	}
	signature, err := crypto.Sign(ethHash.Bytes(), privateKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign"})
		return
	}
	if len(signature) == 65 {
		signature[64] += 27
	}
	sigHex := hexutil.Encode(signature)

	// สร้าง LandVerification
	landVerification := entity.LandVerification{
		Wallet:         walletID,
		Metafields:     metaFields,
		Signature:      sigHex,
		Status_onchain: false,
	}
	if err := tx.Create(&landVerification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create land_verification: " + err.Error()})
		return
	}

	// อัพเดต status_verify ของ landtitle เป็น true และบันทึก LandVerificationID, uuid
	if err := tx.Model(&land).Updates(map[string]interface{}{
		"status_verify":        true,
		"land_verification_id": landVerification.ID,
		"uuid":                 uuidStr,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update landtitle: " + err.Error()})
		return
	}

	// commit เมื่อทุกอย่างสำเร็จ
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit transaction: " + err.Error()})
		return
	}

	// ส่งข้อมูลกลับ frontend
	c.JSON(http.StatusOK, gin.H{
		"walletID":           walletID,
		"metaFields":         metaFields,
		"signature":          sigHex,
		"landVerificationID": landVerification.ID,
		"uuid":               uuidStr,
		"รวม":                land,
	})
}

func GetAllLandData(c *gin.Context) {
	db := config.DB()

	var lands []entity.Landtitle
	// Preload User, Province, District, Subdistrict relations
	if err := db.Preload("User").Preload("Province").Preload("District").Preload("Subdistrict").Find(&lands).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Prepare result for frontend
	var result []gin.H
	for _, l := range lands {
		provinceName := ""
		districtName := ""
		subdistrictName := ""
		if l.Province.ID != 0 {
			provinceName = l.Province.NameTh
		}
		if l.District.ID != 0 {
			districtName = l.District.NameTH
		}
		if l.Subdistrict.ID != 0 {
			subdistrictName = l.Subdistrict.NameTH
		}
		result = append(result, gin.H{
			"idlandtitle":       l.ID,
			"survey_number":     l.SurveyNumber,
			"land_number":       l.LandNumber,
			"survey_page":       l.SurveyPage,
			"title_deed_number": l.TitleDeedNumber,
			"volume":            l.Volume,
			"page":              l.Page,
			"rai":               l.Rai,
			"ngan":              l.Ngan,
			"square_wa":         l.SquareWa,
			"status_verify":     l.Status_verify,
			"province":          provinceName,
			"district":          districtName,
			"subdistrict":       subdistrictName,
			"firstname":         l.User.Firstname,
			"lastname":          l.User.Lastname,
			"metamaskaddress":   l.User.Metamaskaddress,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
