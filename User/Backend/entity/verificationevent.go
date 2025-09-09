package entity

import (
	"time"
)

type VerificationEvent struct {
	ID             uint               `gorm:"primaryKey"`
	VerificationID uint               `gorm:"index;not null"`
	FromStatus     *VerificationStatus `gorm:"type:varchar(20)"`
	ToStatus       VerificationStatus  `gorm:"type:varchar(20);not null"`
	ChangedByUserID *uint             `gorm:"index"`
	Reason         *string
	CreatedAt      time.Time `gorm:"autoCreateTime"`
}