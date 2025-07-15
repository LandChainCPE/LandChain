package entity

import ("gorm.io/gorm"
	   //"time"
)
type Time struct {
	gorm.Model

	Timework string `gorm:"type:varchar(200)"`
	
	Booking []Booking  `gorm:"foreignKey:TimeID"` // 👈 One-to-Many relationship
}
