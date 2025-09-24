package entity

import (
	"gorm.io/gorm"
)

type RequestBuySell struct {
    gorm.Model

    BuyerID uint
    Buyer   Users `gorm:"foreignKey:BuyerID"`

    SellerID uint
    Seller   Users `gorm:"foreignKey:SellerID"`

    LandID uint
	Landtitle Landtitle `gorm:"foreignKey:LandID"`

	// RequestBuySellTypeID uint
	// RequestBuySellType   RequestBuySellType `gorm:"foreignKey:RequestBuySellTypeID;references:ID"`
}
