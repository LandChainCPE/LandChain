package entity
import (
	"gorm.io/gorm"
)
type District struct {
    gorm.Model

	NameTH     string   `json:"name_th"`
	NameEN     string   `json:"name_en"`
	
    ProvinceID uint   // ForeignKey
    Province  Province `gorm:"foreignKey:ProvinceID"`
	Subdistrict []Subdistrict `gorm:"foreignKey:DistrictID"`

	Landsalepost []Landsalepost  `gorm:"foreignKey:DistrictID"` // 👈 One-to-Many relationship
	// Landsalepost []Landsalepost  `gorm:"foreignKey:DistrictID"` // 👈 One-to-Many relationship
	Landtitles    []Landtitle    `gorm:"foreignKey:DistrictID"`
}
//อำเภอ