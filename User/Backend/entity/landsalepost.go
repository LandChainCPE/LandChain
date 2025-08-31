package entity

import "gorm.io/gorm"

type Landsalepost struct {
	gorm.Model
	FirstName     string `gorm:"type:varchar(100)"`
	LastName      string `gorm:"type:varchar(100)"`
	PhoneNumber   string `gorm:"type:varchar(100)"`
	//NumOfLandTitle   string `gorm:"type:varchar(100)"`
	Name        string `gorm:"type:varchar(100)"`
	Image		  string `gorm:"type:varchar(100)"`
	Price 	      float64 `gorm:"type:numeric(15,2);not null"` // ราคาที่ดิน
	Map		      string `gorm:"type:varchar(100)"`

	ProvinceID uint  // 👈 FK 
	Province   Province  `gorm:"foreignKey:ProvinceID"` 

	DistrictID uint
	District	District  `gorm:"foreignKey:DistrictID"` 

	SubdistrictID uint
	Subdistrict	Subdistrict `gorm:"foreignKey:SubdistrictID"` 
	
	TagID 	uint
	Tag	Tag `gorm:"foreignKey:TagID"` 

	LandtitleID uint
	Landtitle   Landtitle  `gorm:"foreignKey:LandtitleID"`
	//Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship

	Roomchat []Roomchat  `gorm:"foreignKey:LandsalepostID"`
	Transaction []Transaction  `gorm:"foreignKey:LandsalepostID"`
	//Photoland []Photoland  `gorm:"foreignKey:LandsalepostID"`
	Photoland []Photoland  `gorm:"foreignKey:LandsalepostID"`
	Location []Location `gorm:"foreignKey:LandsalepostID"` // One-to-One relationship with Location
}