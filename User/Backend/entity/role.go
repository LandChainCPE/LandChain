package entity

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	Role string   `gorm:"type:varchar(100)"`
	Users []Users  `gorm:"foreignKey:RoleID"` // 👈 One-to-Many relationship
}
