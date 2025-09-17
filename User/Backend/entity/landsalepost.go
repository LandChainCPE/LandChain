package entity

import "gorm.io/gorm"

type Landsalepost struct {
	gorm.Model
	FirstName   string  `gorm:"type:varchar(100)" json:"first_name"`
	LastName    string  `gorm:"type:varchar(100)" json:"last_name"`
	PhoneNumber string  `gorm:"type:varchar(100)" json:"phone_number"`
	Name        string  `gorm:"type:varchar(100)" json:"name"`
	Image       string  `gorm:"type:varchar(100)" json:"image"`
	Price       float64 `gorm:"type:numeric(15,2);not null" json:"price"`
	//Map		      string `gorm:"type:varchar(100)" json:"map"`

	ProvinceID uint     `json:"province_id"`
	Province   Province `gorm:"foreignKey:ProvinceID"`

	DistrictID uint     `json:"district_id"`
	District   District `gorm:"foreignKey:DistrictID"`

	SubdistrictID uint        `json:"subdistrict_id"`
	Subdistrict   Subdistrict `gorm:"foreignKey:SubdistrictID"`

	TagID uint `json:"tag_id"`
	Tag   Tag  `gorm:"foreignKey:TagID"`

	LandID    uint      // 👈 FK ไปยัง role.id
	Landtitle Landtitle `gorm:"foreignKey:LandID"`

	UserID uint  `json:"user_id"`
	Users  Users `gorm:"foreignKey:UserID"`

	// StateID uint  `json:"state_id"`
	// States  State `gorm:"foreignKey:StateID"`

	//Booking []Booking `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship โจ้คอมเม้นไม้ก่อน

	Roomchat []Roomchat `gorm:"foreignKey:LandsalepostID"`

	Photoland []Photoland `gorm:"foreignKey:LandsalepostID"`
	Location  []Location  `gorm:"foreignKey:LandsalepostID"` // One-to-One relationship with Location
}
