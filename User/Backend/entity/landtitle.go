package entity

import "gorm.io/gorm"

type Landtitle struct {
	gorm.Model
	// FK ไปยัง Geography / Province / Amphure / District
	GeographyID uint
	Geography   LandGeographies `gorm:"foreignKey:GeographyID"`

	ProvinceID uint
	Province   LandProvinces `gorm:"foreignKey:ProvinceID"`

	AmphureID uint
	Amphure   LandAmphures `gorm:"foreignKey:AmphureID"`

	TambonID uint
	Tambon   LandTambons `gorm:"foreignKey:TambonID"`
	// LandProvincesID uint
	// LandProvinces   LandProvinces
	//Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Landsalepost []Landsalepost `gorm:"foreignKey:LandtitleID"`
	Transaction  []Transaction  `gorm:"foreignKey:LandID"`
	RequestSell  []RequestSell  `gorm:"foreignKey:LandID"`
	RequestBuy   []RequestBuy   `gorm:"foreignKey:LandID"`
}
