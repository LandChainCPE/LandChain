package entity

import "gorm.io/gorm"

type Landsalepost struct {
	gorm.Model
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	PhoneNumber   string `json:"phone_number"`
	Name          string `json:"name"`
	Price         int `json:"price"`

	ProvinceID uint     `json:"province_id"`
	Province   Province `gorm:"foreignKey:ProvinceID"`

	DistrictID uint     `json:"district_id"`
	District   District `gorm:"foreignKey:DistrictID"`

	SubdistrictID uint  `json:"subdistrict_id"`
	Subdistrict	Subdistrict `gorm:"foreignKey:SubdistrictID"`
	

	LandID    uint     `json:"land_id"`
	Landtitle Landtitle `gorm:"foreignKey:LandID"`

	UserID uint  `json:"user_id"`
	Users  Users `gorm:"foreignKey:UserID"`

	// StateID uint  `json:"state_id"`
	// States  State `gorm:"foreignKey:StateID"`

	Roomchat []Roomchat  `gorm:"foreignKey:LandsalepostID"`
	Photoland []Photoland  `gorm:"foreignKey:LandsalepostID"`
	Location []Location `gorm:"foreignKey:LandsalepostID"` // One-to-One relationship with Location
	Tags []Tag `gorm:"many2many:landsalepost_tag;"`

}

