package entity
import (
	"gorm.io/gorm"
)
type Province struct {
	gorm.Model

	Province string `gorm:"type:varchar(100)"`

	NameTH     string   `json:"name_th"`
	NameEN     string   `json:"name_en"`
	District []District `gorm:"foreignKey:ProvinceID"`	
	
	Branch []Branch  `gorm:"foreignKey:ProvinceID"` // 👈 One-to-Many relationship
	Landsalepost []Landsalepost  `gorm:"foreignKey:ProvinceID"` // 👈 One-to-Many relationship
	Landtitles    []Landtitle    `gorm:"foreignKey:ProvinceID"`

}
