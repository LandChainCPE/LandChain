package entity

import "gorm.io/gorm"

type LandProvinces struct {
	gorm.Model
	NameTh      string         `json:"name_th" gorm:"size:100"`
	NameEn      string         `json:"name_en" gorm:"size:100"`
	GeographyID uint           `json:"geography_id" gorm:"index"`
	Amphures    []LandAmphures `json:"amphures" gorm:"foreignKey:ProvinceID"`
}
