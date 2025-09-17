package entity
import (
	"gorm.io/gorm"
)
type Tag struct {
	gorm.Model

	Tag string `gorm:"type:varchar(100)"`
	
	Landsalepost []Landsalepost  `gorm:"many2many:landsalepost_tag;"`
}
