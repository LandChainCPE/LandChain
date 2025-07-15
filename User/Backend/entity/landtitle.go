package entity

import "gorm.io/gorm"

type Landtitle struct {
	gorm.Model
	Field    string `gorm:"type:varchar(100)"`

	UserID uint  // 👈 FK ไปยัง role.id
	Users  Users  `gorm:"foreignKey:UserID"` // 👈 optional: preload ได้

	Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Landsalepost []Landsalepost  `gorm:"foreignKey:LandtitleID"`
}