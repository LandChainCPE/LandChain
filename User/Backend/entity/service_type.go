package entity

import "gorm.io/gorm"
type ServiceType struct {
    gorm.Model
    Service string `gorm:"type:varchar(100);not null;unique" json:"service"` // กำหนดชื่อในฐานข้อมูลให้ตรงกับคอลัมน์
    Booking []Booking `gorm:"foreignKey:ServiceTypeID"` // One-to-Many relationship
}
