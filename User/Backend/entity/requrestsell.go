package entity

import (
	"gorm.io/gorm"
)

type RequestSell struct {
	gorm.Model

	UserID uint  // 👈 FK ไปยัง role.id
	Users  Users `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship

	LandID uint      // 👈 FK ไปยัง role.id
	Lands  Landtitle `gorm:"foreignKey:LandID"`
}
