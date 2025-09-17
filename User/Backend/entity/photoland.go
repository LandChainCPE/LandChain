package entity

import "gorm.io/gorm"

type Photoland struct {
	gorm.Model
    Path string `gorm:"type:text"` // เปลี่ยนจาก varchar(100) เป็น text

	LandsalepostID uint
	Landsalepost   Landsalepost  `gorm:"foreignKey:LandsalepostID"`
}