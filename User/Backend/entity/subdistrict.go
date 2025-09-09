package entity
import (
	"gorm.io/gorm"
)
type Subdistrict struct {
	gorm.Model

	NameTH     string   `json:"name_th"`
	NameEN     string   `json:"name_en"`	
		
	DistrictID uint
	District	District  `gorm:"foreignKey:DistrictID"` 
	
	// Landsalepost []Landsalepost  `gorm:"foreignKey:SubdistrictID"` // 👈 One-to-Many relationship
	Landtitles    []Landtitle    `gorm:"foreignKey:SubdistrictID"`
}
//ตำบล