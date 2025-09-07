package entity

import "gorm.io/gorm"

type Roomchat struct {
	gorm.Model

	LandsalepostID uint         // 👈 FK ไปยัง role.id
	Landsalepost   Landsalepost `gorm:"foreignKey:LandsalepostID"`

	UserID1 uint
	User1   Users `gorm:"foreignKey:UserID1;references:ID"`

	UserID2 uint
	User2   Users `gorm:"foreignKey:UserID2;references:ID"`

	Message []Message `gorm:"foreignKey:RoomchatID"`
}
