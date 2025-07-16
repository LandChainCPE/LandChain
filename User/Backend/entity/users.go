package entity

import "gorm.io/gorm"

type Users struct {
	gorm.Model
	Name     string `gorm:"type:varchar(100)"`
	Email    string `gorm:"type:varchar(100);uniqueIndex"`
	Phonenumber string `gorm:"type:varchar(15);uniqueIndex"`
	Password string `gorm:"type:varchar(255)"`
	Land     string `gorm:"type:varchar(100)"`
	Firstname string `gorm:"type:varchar(100)"`
	Lastname  string `gorm:"type:varchar(100)"`
	RoleID uint  // 👈 FK ไปยัง role.id
	Role   Role  `gorm:"foreignKey:RoleID"` // 👈 optional: preload ได้

	Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Landtitle []Landtitle  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Roomchat []Roomchat  `gorm:"foreignKey:UserID"`
	Transaction []Transaction  `gorm:"foreignKey:UserID"`
}