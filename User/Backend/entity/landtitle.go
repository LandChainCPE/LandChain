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
	ProvinceID  	uint        `form:"province_id"`
	Province   		Province 	`gorm:"foreignKey:ProvinceID"`
	DistrictID  	uint        `form:"district_id"`
	District   		District 	`gorm:"foreignKey:DistrictID"`
	SubdistrictID 	uint        `form:"subdistrict_id"`
	Subdistrict  	Subdistrict `gorm:"foreignKey:SubdistrictID"`

	LandProvinceID uint
    LandProvince   LandProvinces `gorm:"foreignKey:LandProvinceID"`

	// ===== Blockchain Anchors (ผูกกับ NFT/Metadata)
	TokenID     string `gorm:"type:varchar(100);index"`  // token id บนเชน (ถ้าออกแล้ว)

	// ===== Relations (ขาย/ประกาศ)
	Landsaleposts []Landsalepost `gorm:"foreignKey:LandtitleID"`
}
