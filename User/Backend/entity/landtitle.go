package entity

import "gorm.io/gorm"

type Landtitle struct {
	gorm.Model
	SurveyNumber string `json:"survey_number" gorm:"type:varchar(50);not null"` // ระวาง เช่น "5336 IV 8632"
	LandNumber   string `json:"land_number" gorm:"type:varchar(20);not null"`   // เลขที่ดิน เช่น "๑๑"
	SurveyPage   string `json:"survey_page" gorm:"type:varchar(20);not null"`   // หน้าสำรวจ เช่น "๙๔๖๑"
	Tambo_n   string `json:"tambon" gorm:"type:varchar(100);not null"`   // ตำบล

	Number string `gorm:"type:varchar(100)"`

	UserID uint  // 👈 FK ไปยัง role.id
	Users  Users `gorm:"foreignKey:UserID"` // 👈 optional: preload ได้

	// ข้อมูลโฉนด
	TitleDeedNumber string `json:"title_deed_number" gorm:"type:varchar(50);not null"` // เลขที่โฉนด
	Volume          string `json:"volume" gorm:"type:varchar(20);not null"`            // เล่ม
	Page            string `json:"page" gorm:"type:varchar(20);not null"`              // หน้า
	Amphoe   string `json:"amphoe" gorm:"type:varchar(100);not null"`   // อำเภอ
	Provinc_e string `json:"province" gorm:"type:varchar(100);not null"` // จังหวัด


	Rai           int `json:"rai" gorm:"default:0"`             // ไร่
	Ngan          int `json:"ngan" gorm:"default:0"`            // งาน
	SquareWa      int `json:"square_wa" gorm:"default:0"`       // ตารางวา
	
	// FK ไปยัง Geography / Province / Amphure / District
	GeographyID uint
	Geography   LandGeographies `gorm:"foreignKey:GeographyID"`

	ProvinceID uint
	Province   LandProvinces `gorm:"foreignKey:ProvinceID"`

	AmphureID uint
	Amphure   LandAmphures `gorm:"foreignKey:AmphureID"`

	TambonID uint
	Tambon   LandTambons `gorm:"foreignKey:TambonID"`

	LandVerificationID uint
	LandVerification   LandVerification `gorm:"foreignKey:LandVerificationID"`

	// LandProvincesID uint
	// LandProvinces   LandProvinces
	//Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Landsalepost []Landsalepost `gorm:"foreignKey:LandtitleID"`
	Transaction  []Transaction  `gorm:"foreignKey:LandID"`
	RequestSell  []RequestSell  `gorm:"foreignKey:LandID"`
	RequestBuy   []RequestBuy   `gorm:"foreignKey:LandID"`
}
