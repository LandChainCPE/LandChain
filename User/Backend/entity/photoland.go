package entity

import "gorm.io/gorm"

type Photoland struct {
	gorm.Model
	Path string `gorm:"type:varchar(100)"`

	LandsalepostID uint
	Landsalepost   Landsalepost  `gorm:"foreignKey:LandsalepostID"`
}