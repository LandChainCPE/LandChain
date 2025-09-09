package entity

import (
    "time"
)

type VerificationStatus string
const (
	StatusPending    VerificationStatus = "PENDING"
	StatusScheduled  VerificationStatus = "SCHEDULED"
	StatusInProgress VerificationStatus = "IN_PROGRESS"
	StatusApproved   VerificationStatus = "APPROVED"
	StatusRejected   VerificationStatus = "REJECTED"
	StatusExpired    VerificationStatus = "EXPIRED"
	StatusRevoked    VerificationStatus = "REVOKED"
)

type VerificationSubject string
const (
	SubjectUserIdentity      VerificationSubject = "USER_IDENTITY"
	SubjectLandTitleOwnership VerificationSubject = "LAND_TITLE_OWNERSHIP"
)

type Verification struct {
	ID uint `gorm:"primaryKey"`

	// Polymorphic keys (GORM คาด field ชื่อ <Name>ID + <Name>Type)
	SubjectID   uint               `gorm:"index;not null"`
	SubjectType VerificationSubject `gorm:"type:varchar(40);index;not null"`

	Status VerificationStatus `gorm:"type:varchar(20);index;not null;default:'PENDING'"`

	RequestedByUserID *uint  `gorm:"index"` // ใครกดขอ (อาจเป็น user หรือ admin)
	OfficerRef        *string
	EvidenceURI       *string

	ExpiresAt           *time.Time
	OnchainAnchorTxHash *string

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	Events []VerificationEvent `gorm:"foreignKey:VerificationID"`
}
