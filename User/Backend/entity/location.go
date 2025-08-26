package entity

import "gorm.io/gorm"

// Location เก็บข้อมูลพิกัดของโพสต์ขายที่ดินแต่ละจุด
type Location struct {
    gorm.Model
    Sequence      int     `gorm:"not null"`                    // ลำดับของพิกัด
    Latitude      float64 `gorm:"type:decimal(10,6);not null"`
    Longitude     float64 `gorm:"type:decimal(10,6);not null"`
    LandsalepostID uint    `gorm:"not null;index"`              // ไม่ใช้ unique เพื่อให้ one‑to‑many
    Landsalepost   Landsalepost `gorm:"foreignKey:LandsalepostID"`
}
