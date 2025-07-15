package entity
import (
	"gorm.io/gorm"
)
type Province struct {
	gorm.Model

	Province string `gorm:"type:varchar(100)"`
	
	Branch []Branch  `gorm:"foreignKey:ProvinceID"` // 👈 One-to-Many relationship
}
