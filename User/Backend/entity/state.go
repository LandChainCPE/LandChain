package entity

import "gorm.io/gorm"

type State struct {
	gorm.Model
	Name  string `gorm:"type:varchar(100);unique" json:"name"` 
	Color string `gorm:"type:varchar(20)" json:"color"`        

	// ความสัมพันธ์กับ Petition
	Petitions []Petition `gorm:"foreignKey:StateID" json:"petitions"` // Relationship with the Petition model
}