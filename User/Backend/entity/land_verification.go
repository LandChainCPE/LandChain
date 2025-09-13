package entity

import (
	"gorm.io/gorm"
)

type LandVerification struct {
	gorm.Model
	Wallet       string    `json:"wallet" gorm:"type:varchar(255);not null"`
	Metafields   string    `json:"metafields" gorm:"type:text;not null"`
	Signature    string    `json:"signature" gorm:"type:text;not null"`
	Status_onchain		 bool

	Landtitles       []Landtitle `gorm:"foreignKey:LandVerificationID"`
}
