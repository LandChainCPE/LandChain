package entity

import "gorm.io/gorm"

type Typetransaction struct {
	gorm.Model
	Name     string `gorm:"type:varchar(100)"`

	Transaction []Transaction  `gorm:"foreignKey:TypetransactionID"`
}
