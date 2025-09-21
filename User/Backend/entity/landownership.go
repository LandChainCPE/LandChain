package entity

import (
	"gorm.io/gorm"
	"time"
)

// Location เก็บข้อมูลพิกัดของโพสต์ขายที่ดินแต่ละจุด
type LandOwnership struct {
    gorm.Model

	UserID 	uint
	Users   Users `gorm:"foreignKey:UserID"`

	LandID 		uint
	Landtitle   Landtitle `gorm:"foreignKey:LandID"`

	TxHash string

	FromDate time.Time   //วันที่เป็นเจ้าของที่ดิน 
	ToDate   *time.Time	// วันสิ้นสุดเป็นเจ้าของที่ดิน ถ้าเป็น Null แสดงว่าเป็นเจ้าของ ปัจจุบัน


}
