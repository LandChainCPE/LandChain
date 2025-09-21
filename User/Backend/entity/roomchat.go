package entity

import (
	"time"

	"gorm.io/gorm"
)

type Roomchat struct {
	ID        uint           `gorm:"primaryKey"` // ใช้ ID ของตัวเอง
	User1ID   uint           `gorm:"column:user1_id;index;not null"`
	User1     Users          `gorm:"foreignKey:User1ID"`
	User2ID   uint           `gorm:"column:user2_id;index;not null"`
	User2     Users          `gorm:"foreignKey:User2ID"`
	Messages  []Message      `gorm:"foreignKey:RoomID"` // Preload messages
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
