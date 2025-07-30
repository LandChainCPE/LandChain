package entity

import "gorm.io/gorm"

type Branch struct {
	gorm.Model

	Branch string   `gorm:"type:varchar(100)"`

	ProvinceID uint  // 👈 FK 
	Province   Province  `gorm:"foreignKey:ProvinceID"` 

	Booking []Booking `gorm:"foreignKey:BranchID"`
	time []Time `gorm:"foreignKey:BranchID"` // 👈 One-to-Many relationship

}

