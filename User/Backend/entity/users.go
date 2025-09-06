package entity

import "gorm.io/gorm"

type Users struct {
	gorm.Model
	Firstname string `gorm:"type:varchar(100)"`
	Lastname  string `gorm:"type:varchar(100)"`
	// Name     string `gorm:"type:varchar(100)"`
	Email           string `gorm:"type:varchar(100);uniqueIndex"`
	Phonenumber     string `gorm:"type:varchar(15);uniqueIndex"`
	Metamaskaddress string `gorm:"type:varchar(255)"`
	// Publickey string `gorm:"type:varchar(255)"`
	// Password string `gorm:"type:varchar(255)"`
	// Land     string `gorm:"type:varchar(100)"`
	RoleID uint // :point_left: FK ไปยัง role.id
	Role   Role `gorm:"foreignKey:RoleID"` // :point_left: optional: preload ได้

	UserVerificationID uint // :point_left: FK ไปยัง role.id
	UserVerification   UserVerification `gorm:"foreignKey:UserVerificationID"`

	Booking           []Booking     `gorm:"foreignKey:UserID"` // :point_left: One-to-Many relationship
	Petition          []Petition    `gorm:"foreignKey:UserID"`
	State             []State       `gorm:"foreignKey:UserID"`
	RoomchatUser1     []Roomchat    `gorm:"foreignKey:UserID1"`
	RoomchatUser2     []Roomchat    `gorm:"foreignKey:UserID2"`
	TransactionBuyer  []Transaction `gorm:"foreignKey:BuyerID"`
	TransactionSeller []Transaction `gorm:"foreignKey:SellerID"`
	RequestBuy        []RequestBuy  `gorm:"foreignKey:UserID"`
	RequestSell       []RequestSell `gorm:"foreignKey:UserID"`

}
