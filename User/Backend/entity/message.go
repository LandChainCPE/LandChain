package entity

import (
	"time"

	"gorm.io/gorm"
)

type Message struct {
	ID        uint           `gorm:"primaryKey"`
	IsRead    bool           `gorm:"default:false"`
	Type      string         `gorm:"type:text"`
	Content   string         `gorm:"type:text"`
	RoomID    uint           `gorm:"index;not null"`
	Room      Roomchat       `gorm:"foreignKey:RoomID;constraint:OnDelete:CASCADE"`
	SenderID  uint           `gorm:"index;not null"`
	Sender    Users          `gorm:"foreignKey:SenderID;constraint:OnDelete:SET NULL"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
