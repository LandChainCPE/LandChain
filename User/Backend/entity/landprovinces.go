package entity

import "gorm.io/gorm"

type LandProvinces struct {
	gorm.Model
	Name string

	//Landtitle *Landtitle `gorm:"foreignKey:LandProvincesID"` // ✅ ใช้ pointer
}
