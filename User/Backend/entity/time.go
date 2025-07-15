package entity

import ("gorm.io/gorm"
	   "time"
)
type Time struct {
	gorm.Model
	time time.Time
	Booking []Booking  `gorm:"foreignKey:TimeID"` // 👈 One-to-Many relationship
}
