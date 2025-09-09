package entity

import (
	"time"

	"gorm.io/gorm"
)

type Message struct {
	gorm.Model
	Type    string
	Message string
	Time    time.Time

	RoomchatID uint
	Roomchat   Roomchat `gorm:"foreignKey:RoomchatID"`

	SenderID uint
	Sender   Users `gorm:"foreignKey:SenderID"` // <-- ฟิลด์นี้อาจเป็นปัญหา ถ้าไม่มีในฐานข้อมูล หรือไม่ได้ตั้งค่า
}
