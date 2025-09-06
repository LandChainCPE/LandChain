package entity

import "gorm.io/gorm"

type LandVerification struct {
	gorm.Model
	Wallet     string `json:"wallet"`
	Metafields string `json:"metafields"`
	Signature  string `json:"signature"`

	Landtitle       []Landtitle `gorm:"foreignKey:LandVerificationID"`
}
