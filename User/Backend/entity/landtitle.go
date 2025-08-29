package entity

import(
	"gorm.io/gorm"
	"time"
)

type Landtitle struct {
	gorm.Model
	Field string `gorm:"type:varchar(100)"`

	UserID uint  // 👈 FK ไปยัง role.id
	Users  Users `gorm:"foreignKey:UserID"` // 👈 optional: preload ได้

	LandProvincesID uint
	LandProvinces   LandProvinces

	//Booking []Booking  `gorm:"foreignKey:UserID"` // 👈 One-to-Many relationship
	Landsalepost []Landsalepost `gorm:"foreignKey:LandtitleID"`

	Verifications []Verification `gorm:"polymorphic:Subject;"`
	OwnershipVerificationStatus *string    `gorm:"type:varchar(20)"`
    OwnershipVerifiedAt         *time.Time `gorm:""`


}
