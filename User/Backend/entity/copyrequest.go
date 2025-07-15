package entity

import "gorm.io/gorm"

type Copyrequest struct {
	gorm.Model

	purpose string   `gorm:"type:varchar(100)"`

}
