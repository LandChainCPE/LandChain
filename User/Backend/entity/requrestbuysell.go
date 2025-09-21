package entity

import (
	"gorm.io/gorm"
)

type RequestBuySell struct {
	gorm.Model

	BuyerID uint
	Buyer   Users `gorm:"foreignKey:BuyerID;references:ID"`

	SellerID uint
	Seller   Users `gorm:"foreignKey:SellerID;references:ID"`

	LandID    uint
	Landtitle Landtitle `gorm:"foreignKey:LandID;references:ID"`

	// RequestBuySellTypeID uint
	// RequestBuySellType   RequestBuySellType `gorm:"foreignKey:RequestBuySellTypeID;references:ID"`
}
