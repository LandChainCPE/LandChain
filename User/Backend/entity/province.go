package entity

type Province struct {
	ID       int    `gorm:"primaryKey;autoIncrement"`
	Province string `gorm:"not null"`
	Branch []Branch  `gorm:"foreignKey:ProvinceID"` // 👈 One-to-Many relationship
}
