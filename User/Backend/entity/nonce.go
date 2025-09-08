package entity

import (
	"time"

	"gorm.io/gorm"
)

// Nonce entity for storing nonce per address
// Table name: nonces
type Nonce struct {
	gorm.Model
	Address   string    `gorm:"index;not null"`
	Nonce     string    `gorm:"not null"`
	ExpiresAt time.Time `gorm:"index"`
}
