package entity

import (
    //"time"
    "gorm.io/gorm"
)



type Booking struct {
	gorm.Model
	DateBooking string `json:"date_booking" gorm:"type:date;not null"`
    
    TimeID   uint   `json:"time_id" gorm:"not null"`
    Time     Time   `gorm:"foreignKey:TimeID"`
    
    UserID   uint   `json:"user_id" gorm:"not null"`
    Users    Users  `gorm:"foreignKey:UserID"`
    
    BranchID uint   `json:"branch_id" gorm:"not null"`
    Branch   Branch `gorm:"foreignKey:BranchID"`
}
