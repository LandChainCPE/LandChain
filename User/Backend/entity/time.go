package entity

import ("gorm.io/gorm"
	   //"time"
)
type Time struct {
	gorm.Model

	Timework string `gorm:"type:varchar(200)"`
	MaxCapacity int     // จำนวนสูงสุดของผู้ใช้บริการ
	
	Booking []Booking  `gorm:"foreignKey:TimeID"` // 👈 One-to-Many relationship
	BranchID uint   `json:"branch_id"`
    Branch   Branch `gorm:"foreignKey:BranchID"`
	// p
}
