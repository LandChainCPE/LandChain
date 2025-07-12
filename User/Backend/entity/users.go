package entity

import "gorm.io/gorm"

type Users struct {
	gorm.Model
	Name     string `gorm:"type:varchar(100)"`
	Password string `gorm:"type:varchar(255)"`
	Land     string `gorm:"type:varchar(100)"`

	RoleID uint  // 👈 FK ไปยัง role.id
	Role   Role  `gorm:"foreignKey:RoleID"` // 👈 optional: preload ได้
}