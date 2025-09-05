package entity

import "gorm.io/gorm"

type LandProvinces struct {
	gorm.Model
	Name string

	Landtitles []Landtitle `gorm:"foreignKey:LandProvinceID"` // ✅ ใช้ pointer
}
