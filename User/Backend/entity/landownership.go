package entity

import "gorm.io/gorm"

// Location เก็บข้อมูลพิกัดของโพสต์ขายที่ดินแต่ละจุด
type LandOwnership struct {
    gorm.Model

	UserID 	uint
	Users   Users `gorm:"foreignKey:UserID"`

	LandID 		uint
	Landtitle   Landtitle `gorm:"foreignKey:LandID"`

	TxHash string


}
