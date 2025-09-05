package entity

import "gorm.io/gorm"

type Landsalepost struct {
	gorm.Model
	Name     string `gorm:"type:varchar(100)"`
	PhoneNumber string `gorm:"type:varchar(100)"`
	NumOfLandTitle   string `gorm:"type:varchar(100)"`
	AdressLandplot   string `gorm:"type:varchar(100)"`
	Price float64 `gorm:"type:numeric(15,2);not null"` // ราคาที่ดิน

	LandtitleID uint
	Landtitle   Landtitle  `gorm:"foreignKey:LandtitleID"`

	ProvinceID  	uint        `gorm:"index"`
	Province   		Province 	`gorm:"foreignKey:ProvinceID"`
	DistrictID  	uint        `gorm:"index"`
	District   		District 	`gorm:"foreignKey:DistrictID"`
	SubdistrictID 	uint        `gorm:"index"`
	Subdistrict  	Subdistrict `gorm:"foreignKey:SubdistrictID"`


	//Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Roomchat []Roomchat  `gorm:"foreignKey:LandsalepostID"`
	Transaction []Transaction  `gorm:"foreignKey:LandsalepostID"`
	Photoland []Photoland  `gorm:"foreignKey:LandsalepostID"`
	Location []Location `gorm:"foreignKey:LandsalepostID"` // One-to-One relationship with Location
}