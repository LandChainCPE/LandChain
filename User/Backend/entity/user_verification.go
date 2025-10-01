package entity

import (
	"gorm.io/gorm"
)

type UserVerification struct {
	gorm.Model
	Wallet       string    `json:"wallet" gorm:"type:varchar(255);not null"`
	NameHashSalt string    `json:"namehash_salt" gorm:"type:varchar(255);not null"`
	Signature    string    `json:"signature" gorm:"type:text;not null"`
	RandomSalt   string    `json:"randomsalt" gorm:"type:varchar(255);not null"`
	// TxHash 		 *string
	Status_onchain		 bool

	Users       []Users `gorm:"foreignKey:UserVerificationID"`
}


