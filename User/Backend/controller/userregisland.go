package controller

import (
	"fmt"
	"landchain/config"
	"landchain/entity"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ไว้ใช้ bind form-data อย่างปลอดภัย ไม่ผูก gorm.Model ตรง ๆ
type LandtitleCreateRequest struct {
	DeedNumber string `form:"deed_number" binding:"required"`

	// Address
	VillageNo string `form:"village_no"`
	Soi       string `form:"soi"`
	Road      string `form:"road"`

	// Parcel size
	Rai      int `form:"rai"`
	Ngan     int `form:"ngan"`
	SquareWa int `form:"square_wa"`

	// Location IDs
	ProvinceID   uint `form:"province_id"`
	DistrictID   uint `form:"district_id"`
	SubdistrictID uint `form:"subdistrict_id"`

	// Status (ถ้าอยากกำหนดเองจากฟอร์ม; ไม่ส่งมาก็ตั้งค่าเริ่มต้น)
	Status string `form:"status"`
}

// RegisterLand บันทึกข้อมูลโฉนดที่ดิน (multipart/form-data)
func RegisterLand(c *gin.Context) {
	db := config.DB()

	// ดึง user จาก middleware (เช่น middlewares.Authorizes())
	var userID uint
	if v, ok := c.Get("userID"); ok {
		if id, ok := v.(uint); ok {
			userID = id
		}
	}
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// bind form-data
	var req LandtitleCreateRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input", "detail": err.Error()})
		return
	}

	// กันเลขโฉนดซ้ำ (respect soft delete: deleted_at IS NULL)
	var exists int64
	if err := db.Model(&entity.Landtitle{}).
		Where("deed_number = ? AND deleted_at IS NULL", req.DeedNumber).
		Count(&exists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	if exists > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "deed_number already exists"})
		return
	}

	// เตรียมเซฟไฟล์โฉนด (optional) — ฟิลด์ในฟอร์มชื่อ "deed_image"
	var deedImagePath string
	file, err := c.FormFile("deed_image")
	if err == nil && file != nil {
		// สร้างโฟลเดอร์อัปโหลดแบบแยกวัน
		baseDir := "./uploads/deeds"
		dateDir := time.Now().Format("2006-01-02")
		uploadDir := filepath.Join(baseDir, dateDir)
		if mkErr := os.MkdirAll(uploadDir, 0o755); mkErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create upload directory"})
			return
		}

		ext := filepath.Ext(file.Filename) // .pdf / .jpg / .png
		newName := fmt.Sprintf("%s%s", uuid.NewString(), ext)
		savePath := filepath.Join(uploadDir, newName)

		if saveErr := c.SaveUploadedFile(file, savePath); saveErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save deed image"})
			return
		}

		deedImagePath = savePath
	}

	// ตั้งค่าเริ่มต้น status ถ้าไม่ส่งมา
	status := req.Status
	if status == "" {
		status = "PENDING"
	}
	now := time.Now()

	// map เข้า entity
	land := entity.Landtitle{
		Model:        gorm.Model{},
		DeedNumber:   req.DeedNumber,
		VillageNo:    req.VillageNo,
		Soi:          req.Soi,
		Road:         req.Road,
		Rai:          req.Rai,
		Ngan:         req.Ngan,
		SquareWa:     req.SquareWa,
		DeedImagePath: deedImagePath,

		UserID:        userID,
		ProvinceID:    req.ProvinceID,
		DistrictID:    req.DistrictID,
		SubdistrictID: req.SubdistrictID,

		Status:          status,
		StatusUpdatedAt: &now,

		// เริ่มต้น verification เป็น PENDING ได้ถ้าต้องการ
		// OwnershipVerificationStatus: ptr("PENDING"),
		// OwnershipVerifiedAt:        nil,

		// TokenID ปล่อยว่างไว้ก่อน จนกว่าจะ mint NFT
	}

	// สร้าง record
	if err := db.Create(&land).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create land", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "land created",
		"land":    land,
	})
}
