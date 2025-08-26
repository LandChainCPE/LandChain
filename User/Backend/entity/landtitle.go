package entity

import "gorm.io/gorm"

type Landtitle struct {
	gorm.Model
	HouseNumber     string `gorm:"type:varchar(100)"` 
	VillageNo       string `gorm:"type:varchar(50)"`
	Soi             string `gorm:"type:varchar(100)"`
	Road            string `gorm:"type:varchar(100)"`
	Rai             int
	Ngan            int
	SquareWa        int
	ImagePath       string

	// FK: ผู้ใช้ที่เป็นเจ้าของโฉนด
	UserID uint
	User   Users `gorm:"foreignKey:UserID"`

	// FK: จังหวัด
	LandProvinceID uint
	LandProvince   LandProvinces `gorm:"foreignKey:LandProvinceID"`

	// // FK: อำเภอ
	// LandDistrictID uint
	// LandDistrict   LandDistricts `gorm:"foreignKey:LandDistrictID"`

	// // FK: ตำบล
	// LandSubdistrictID uint
	// LandSubdistrict   LandSubdistricts `gorm:"foreignKey:LandSubdistrictID"`

	// // FK: สถานะโฉนด
	// StatusID uint
	// Status   Status `gorm:"foreignKey:StatusID"`

	// ความสัมพันธ์กับตาราง land_transfer หรือ landsalepost (1:N)
	Landsaleposts []Landsalepost `gorm:"foreignKey:LandtitleID"`
}
