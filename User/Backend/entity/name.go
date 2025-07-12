package entity

type Name struct {
	ID   uint   `gorm:"primaryKey;autoIncrement"`
	Name string `gorm:"type:text"`
}

// (ไม่จำเป็นต้องกำหนด TableName ถ้าชื่อตรง)
