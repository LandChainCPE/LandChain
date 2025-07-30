package entity

import "gorm.io/gorm"

type State struct {
	gorm.Model
	Name  string `gorm:"type:varchar(100);unique" json:"name"` 
	Color string `gorm:"type:varchar(20)" json:"color"`  

	UserID uint  `json:"user_id"`// 👈 FK ไปยัง role.id
	Users  Users `gorm:"foreignKey:UserID"`  

	// ความสัมพันธ์กับ Petition
	Petitions []Petition `gorm:"foreignKey:StateID" json:"petitions"` // Relationship with the Petition model
}