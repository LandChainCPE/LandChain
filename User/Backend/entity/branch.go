package entity

import "gorm.io/gorm"

type Branch struct {
	gorm.Model
	Branch string   `gorm:"type:varchar(100)"`
	Booking []Booking `gorm:"foreignKey:BranchID"`

	ProvinceID uint  // 👈 FK 
	Province   Province  `gorm:"foreignKey:ProvinceID"` 
}
