package entity
import (
	"gorm.io/gorm"
)
type Tag struct {
	gorm.Model

	Tag string `gorm:"type:varchar(100)"`
	
	Landsalepost []Landsalepost  `gorm:"foreignKey:TagID"` // 👈 One-to-Many relationship
}
//แท็ก