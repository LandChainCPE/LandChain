package entity

import (
	"time"
	"gorm.io/gorm"
)

type Landtitle struct {
	gorm.Model

	// ===== Identifiers (สำคัญ)
	DeedNumber     string `form:"deed_number" binding:"required"` // เลขโฉนด (unique ต่อ row ที่ไม่ถูกลบ)

	// ===== Address (ที่อยู่แปลง)
	VillageNo   string `form:"village_no"`
	Soi         string `form:"soi"`
	Road        string `form:"road"`

	// ===== Parcel size (ขนาดที่ดิน)
	Rai      int    `form:"rai"`
	Ngan     int    `form:"ngan"`
	SquareWa int    `form:"square_wa"`

	DeedImagePath string `gorm:"type:varchar(255)"` // ✅ ไฟล์สแกนโฉนด (PDF/JPG)

	// ===== Ownership (เจ้าของในระบบ)
	UserID uint  `gorm:"index"` // FK -> Users.ID
	Users  Users `gorm:"foreignKey:UserID"`

	// ===== Province/District/Subdistrict (กำหนดตามที่คุณมีอยู่ในโปรเจค)
	ProvinceID  	uint        `gorm:"index"`
	Province   		Province 	`gorm:"foreignKey:ProvinceID"`
	DistrictID  	uint        `gorm:"index"`
	District   		District 	`gorm:"foreignKey:DistrictID"`
	SubdistrictID 	uint        `gorm:"index"`
	Subdistrict  	Subdistrict `gorm:"foreignKey:SubdistrictID"`

	LandProvinceID uint
    LandProvince   LandProvinces `gorm:"foreignKey:LandProvinceID"`

	// ===== Status (สถานะโฉนดในระบบแอป; แนะนำทำเป็นตาราง Status แยก หรือ enum string)
	Status           string     `form:"status"` // เช่น PENDING/ACTIVE/ENCUMBERED/REVOKED
	StatusUpdatedAt  *time.Time

	// ===== Verification (ยืนยันกรรมสิทธิ์/ตรวจกับกรมที่ดิน)
	Verifications                []Verification `gorm:"polymorphic:Subject;polymorphicValue:landtitle"`
	OwnershipVerificationStatus  *string        `gorm:"type:varchar(20)"` // เช่น PENDING/APPROVED/REJECTED
	OwnershipVerifiedAt          *time.Time

	// ===== Blockchain Anchors (ผูกกับ NFT/Metadata)
	TokenID     string `gorm:"type:varchar(100);index"`  // token id บนเชน (ถ้าออกแล้ว)

	// ===== Relations (ขาย/ประกาศ)
	Landsaleposts []Landsalepost `gorm:"foreignKey:LandtitleID"`
}
