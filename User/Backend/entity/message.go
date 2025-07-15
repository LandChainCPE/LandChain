package entity

import (
	"gorm.io/gorm"
	"time"
)

type Message struct {
	gorm.Model
	Message    string `gorm:"type:varchar(200)"`
	Time time.Time

	RoomchatID uint  // 👈 FK ไปยัง role.id
	Roomchat  Roomchat  `gorm:"foreignKey:RoomchatID"`
}