package entity

import (
	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model

	Amount                 float64
	BuyerAccepted          bool
	SellerAccepted         bool
	MoneyChecked           bool
	LandDepartmentApproved bool

	TypetransactionID uint            // 👈 FK ไปยัง role.id
	Typetransaction   Typetransaction `gorm:"foreignKey:TypetransactionID"`

	BuyerID  uint  `gorm:"type:size(20)"`
	Buyer    Users `gorm:"foreignKey:BuyerID"`
	SellerID uint  `gorm:"type:size(20)"`
	Seller   Users `gorm:"foreignKey:SellerID"`
	// 👈 FK ไปยัง role.id

	LandID    uint      // 👈 FK ไปยัง role.id
	Landtitle Landtitle `gorm:"foreignKey:LandID"`
}
