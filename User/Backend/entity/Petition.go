package entity

import "gorm.io/gorm"

type Petition struct {
	gorm.Model
	FirstName   string `gorm:"type:varchar(100)" json:"first_name"`
	LastName    string `gorm:"type:varchar(100)" json:"last_name"`
	Tel         string `gorm:"type:varchar(15)" json:"tel"`
	Email       string `gorm:"type:varchar(100)" json:"email"`
	Description string `gorm:"type:text" json:"description"`
	Date        string `gorm:"type:date" json:"date"`
	Topic       string `gorm:"type:varchar(255)" json:"topic"`

    StateID uint   `json:"state_id"`
    State   *State `gorm:"foreignKey:StateID"`

	UserID uint  `json:"user_id"`// 👈 FK ไปยัง role.id
	Users  Users `gorm:"foreignKey:UserID"`
}