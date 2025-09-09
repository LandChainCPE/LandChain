package entity

import (
	"gorm.io/gorm"
)

type RequestBuy struct {
	gorm.Model

	UserID uint  // 👈 FK ไปยัง role.id
	Users  Users `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship

	LandID    uint      // 👈 FK ไปยัง role.id
	Landtitle Landtitle `gorm:"foreignKey:LandID"`
}
