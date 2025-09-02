package entity

import "gorm.io/gorm"

type LandGeographies struct {
	gorm.Model
	Name      string          `json:"name" gorm:"size:100"`
	Provinces []LandProvinces `json:"provinces" gorm:"foreignKey:GeographyID"`
}
