package entity

import (
	"gorm.io/gorm"
	"time"
)

type Transaction struct {
	gorm.Model
	time time.Time

	TypetransactionID uint            // 👈 FK ไปยัง role.id
	Typetransaction   Typetransaction `gorm:"foreignKey:TypetransactionID"`

	UserID uint  // 👈 FK ไปยัง role.id
	Users  Users `gorm:"foreignKey:UserID"`

	LandsalepostID uint  // 👈 FK ไปยัง role.id
	Landsalepost  Landsalepost `gorm:"foreignKey:LandsalepostID"`
}
