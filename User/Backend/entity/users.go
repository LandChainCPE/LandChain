package entity

import (
	"gorm.io/gorm"
    "time"
)

type Users struct {
	gorm.Model
	Firstname       string `gorm:"type:varchar(100)"`
	Lastname        string `gorm:"type:varchar(100)"`
	Email           string `gorm:"type:varchar(100);uniqueIndex"`
	Phonenumber     string `gorm:"type:varchar(15);uniqueIndex"`
	Metamaskaddress string `gorm:"type:varchar(255)"`

	RoleID uint
	Role   Role `gorm:"foreignKey:RoleID"`

	Booking      []Booking     `gorm:"foreignKey:UserID"`
	Landtitle    []Landtitle   `gorm:"foreignKey:UserID"`
	Roomchat     []Roomchat    `gorm:"foreignKey:UserID"`
	Transaction  []Transaction `gorm:"foreignKey:UserID"`
	Petition     []Petition    `gorm:"foreignKey:UserID"`

	// ✅ แทนที่ State[] เดิมด้วย Verifications แบบ polymorphic
	Verifications []Verification `gorm:"polymorphic:Subject;"`

	// ✅ คอลัมน์สรุปสถานะล่าสุด (denormalized) เพื่อ query เร็ว ๆ
	IdentityVerificationStatus *string    `gorm:"type:varchar(20)"`
	IdentityVerifiedAt         *time.Time `gorm:""`
}