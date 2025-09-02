package entity

import "gorm.io/gorm"

type LandAmphures struct {
	gorm.Model
	NameTh     string        `json:"name_th" gorm:"size:100"`
	NameEn     string        `json:"name_en" gorm:"size:100"`
	ProvinceID uint          `json:"province_id" gorm:"index"`
	Tambons    []LandTambons `json:"tambons" gorm:"foreignKey:AmphureID"`
}
