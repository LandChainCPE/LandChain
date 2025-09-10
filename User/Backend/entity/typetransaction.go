package entity

import "gorm.io/gorm"

type Typetransaction struct {
	gorm.Model
	StatusNameTh string
	StatusNameEn string

	Transaction []Transaction `gorm:"foreignKey:TypetransactionID"`
}
