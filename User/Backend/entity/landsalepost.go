package entity

import "gorm.io/gorm"

type Landsalepost struct {
	gorm.Model
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	PhoneNumber   string `json:"phone_number"`
	Name          string `json:"name"`
	Image         string `json:"image"`
	Price         int `json:"price"`
// //แผนที่
//     Sequence      int     `gorm:"not null"`                    // ลำดับของพิกัด
//     Latitude      float64 `gorm:"type:decimal(10,6);not null"`
//     Longitude     float64 `gorm:"type:decimal(10,6);not null"`

	ProvinceID uint  `json:"province_id"`
	Province   Province  `gorm:"foreignKey:ProvinceID"`

	DistrictID uint `json:"district_id"`
	District	District  `gorm:"foreignKey:DistrictID"`

	SubdistrictID uint  `json:"subdistrict_id"`
	Subdistrict	Subdistrict `gorm:"foreignKey:SubdistrictID"`
	
	TagID 	uint `json:"tag_id"`
	Tag	Tag `gorm:"foreignKey:TagID"`

	LandID    uint     `json:"landtitle_id"`
	Landtitle Landtitle `gorm:"foreignKey:LandID"`

	UserID uint  `json:"user_id"`
	Users  Users `gorm:"foreignKey:UserID"`

	// StateID uint  `json:"state_id"`
	// States  State `gorm:"foreignKey:StateID"`

	Roomchat []Roomchat  `gorm:"foreignKey:LandsalepostID"`
	Transaction []Transaction  `gorm:"foreignKey:LandsalepostID"`
	Photoland []Photoland  `gorm:"foreignKey:LandsalepostID"`
	Location []Location `gorm:"foreignKey:LandsalepostID"` // One-to-One relationship with Location
}

