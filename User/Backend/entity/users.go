package entity

import "gorm.io/gorm"

type Users struct {
    gorm.Model
    Firstname string `gorm:"type:varchar(100)"`
    Lastname  string `gorm:"type:varchar(100)"`
    // Name     string `gorm:"type:varchar(100)"`
    Email    string `gorm:"type:varchar(100);uniqueIndex"`
    Phonenumber string `gorm:"type:varchar(15);uniqueIndex"`
    Metamaskaddress string `gorm:"type:varchar(255)"`
    // Publickey string `gorm:"type:varchar(255)"`
    // Password string `gorm:"type:varchar(255)"`
    // Land     string `gorm:"type:varchar(100)"`
    RoleID uint  // :point_left: FK ไปยัง role.id
    Role   Role  `gorm:"foreignKey:RoleID"` // :point_left: optional: preload ได้

	Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Landtitle []Landtitle  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Roomchat []Roomchat  `gorm:"foreignKey:UserID"`
	Transaction []Transaction  `gorm:"foreignKey:UserID"`
	Petition []Petition  `gorm:"foreignKey:UserID"`

}