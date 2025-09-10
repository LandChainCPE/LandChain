package entity

import (
	"gorm.io/gorm"
)

type RequestBuySellType struct {
	gorm.Model
	StatusNameTh string 
	StatusNameEn string 


	RequestBuySells []RequestBuySell `gorm:"foreignKey:RequestBuySellTypeID"`


}
