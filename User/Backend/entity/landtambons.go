package entity

import "gorm.io/gorm"

type LandTambons struct {
	gorm.Model
	ZipCode   uint `json:"zip_code" gorm:"size:30"`
	NameTh    string `json:"name_th" gorm:"size:100"`
	NameEn    string `json:"name_en" gorm:"size:100"`
	AmphureID uint   `json:"amphure_id" gorm:"index"`
}
