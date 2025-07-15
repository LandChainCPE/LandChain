package entity

import "gorm.io/gorm"

type Roomchat struct {
	gorm.Model

	LandsalepostID uint         // 👈 FK ไปยัง role.id
	Landsalepost   Landsalepost `gorm:"foreignKey:LandsalepostID"`

	UserID uint         // 👈 FK ไปยัง role.id
	Users   Users `gorm:"foreignKey:UserID"`

	Message []Message  `gorm:"foreignKey:RoomchatID"`
}
