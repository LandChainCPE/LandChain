package entity

import "gorm.io/gorm"

type Booking struct {
	gorm.Model
	TimeID uint  // 👈 FK ไปยัง role.id
	Time   Time  `gorm:"foreignKey:TimeID"` // 👈 optional: preload ได้

	UserID uint  // 👈 FK ไปยัง role.id
	Users   Users  `gorm:"foreignKey:UserID"` // 👈 optional: preload ได้

	BranchID uint  // 👈 FK ไปยัง role.id
	Branch   Branch  `gorm:"foreignKey:BranchID"` // 👈 optional: preload ได้

}
