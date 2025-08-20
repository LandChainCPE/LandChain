package entity

import "gorm.io/gorm"

type Location struct {
    gorm.Model
    Latitude    float64   `gorm:"type:decimal(10,6);not null"`
    Longitude   float64   `gorm:"type:decimal(10,6);not null"`
    LandsalepostID uint   `gorm:"unique"`
    Landsalepost   Landsalepost `gorm:"foreignKey:LandsalepostID"`
}
