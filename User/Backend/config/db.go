package config

import (
	"fmt"
	"landchain/entity"
	"log"
	"os"

	// "time"

	"encoding/csv"
	"strconv"

	// "github.com/google/uuid"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectDatabase() *gorm.DB {
	// โหลด .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Failed to load .env file")
	}

	// DSN														require      disable

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Bangkok",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("SSL_MODE"),
	)
	// log.Println("DSN:", dsn) // ✅ สำหรับ Debug

	// เชื่อมต่อ DB
	connection, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect database:", err)
	}

	db = connection // ✅ เก็บไว้ใน global variable
	log.Println("✅ Database Connected")
	return db
}

// ✅ SetupDatabase: ทำ Drop Table, AutoMigrate, และ Seed ข้อมูล
// แก้ไขในส่วน SetupDatabase() - ย้ายการสร้าง Roomchat ไปหลัง Landsalepost
func SetupDatabase() {
	if db == nil {
		log.Fatal("❌ Database connection not initialized. Please call ConnectDatabase() first.")
	}

	// Import CSV

	// AutoMigrate
	if err := db.AutoMigrate(
		&entity.Role{},
		&entity.UserVerification{}, /////
		&entity.Users{},
		&entity.Time{},
		&entity.Province{},
		&entity.Branch{},
		&entity.Booking{},
		&entity.Typetransaction{},
		&entity.ServiceType{},
		&entity.LandVerification{}, /////

		&entity.Landsalepost{},
		&entity.Transaction{},
		&entity.Photoland{},
		&entity.Roomchat{},
		&entity.Message{},
		&entity.Copyrequest{},
		&entity.Petition{},
		&entity.State{},
		&entity.Location{},
		&entity.ServiceType{},
		&entity.Landtitle{},
		&entity.RequestBuySell{},
		&entity.Tag{},
		&entity.District{},
		&entity.Subdistrict{},
		&entity.Nonce{},
		// &entity.LandOwnership{},
	); err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}

	ImportProvincesCSV(db, "./config/data/address/provinces.csv")
	ImportDistrictsCSV(db, "./config/data/address/districts.csv")
	ImportSubDistrictsCSV(db, "./config/data/address/subdistricts.csv")

	// Seed Data
	var count int64
	db.Model(&entity.Users{}).Count(&count)

	// สร้าง ServiceType ก่อน
	var serviceCount int64
	db.Model(&entity.ServiceType{}).Count(&serviceCount)
	if serviceCount == 0 {
		db.Create(&entity.ServiceType{Service: "ยืนยันกระเป๋าตังอิเล็กทรอนิกส์"})
		db.Create(&entity.ServiceType{Service: "ขอคัดสำเนาโฉนด"})
	}

	if count == 0 {
		// สร้าง Role
		db.Create(&entity.Role{Role: "User"})
		db.Create(&entity.Role{Role: "Admin"})

		RefRole := uint(1)
		RefRole2 := uint(2)
		
		//Aut  Azure
		db.Create(&entity.Users{Firstname: "RattaponChome", Lastname: "Phonthaisong", Email: "ponthaisongfc@gmail.com", Phonenumber: "0685231245", Metamaskaddress: "0x81c7a15ae0b72cade82d428844cff477f6e364b5", RoleID: RefRole2}) 
		db.Create(&entity.Users{Firstname: "PanachaiBrave", Lastname: "Potisuwan", Email: "Panachai@gmail.com", Phonenumber: "0889741245", Metamaskaddress: "0xc3dce9c6953f9d64527f80e7682078b3643d6b2e", RoleID: RefRole})
		db.Create(&entity.Users{Firstname: "NothEdge", Lastname: "Potisuwan", Email: "Noth@gmail.com", Phonenumber: "0657412369", Metamaskaddress: "0x29bb9d73db3255afe50e56ebc68b2198bfa43003", RoleID: RefRole})
		db.Create(&entity.Users{Firstname: "TestFirefox", Lastname: "Suranaree", Email: "Suranaree@gmail.com", Phonenumber: "0998541236", Metamaskaddress: "0x49c5c43f7fda86522bbfceffba8c0dbc4700a129", RoleID: RefRole})

		//Jo   LocalHost
		// db.Create(&entity.Users{Firstname: "RattaponJChome", Lastname: "JPhonthaisong", Email: "Jponthaisongfc@gmail.com", Phonenumber: "0685231245", Metamaskaddress: "0x2ac553f505a5e05b1a61fe02efaed2a30036e233", RoleID: RefRole2}) 
		// db.Create(&entity.Users{Firstname: "PanachaiJBrave", Lastname: "JPotisuwan", Email: "JPanachai@gmail.com", Phonenumber: "0889741245", Metamaskaddress: "0xf274e000d3c461dd7fc3e839579451c89a5d0d36", RoleID: RefRole})
		// db.Create(&entity.Users{Firstname: "NothJEdge", Lastname: "JPotisuwan", Email: "JNoth@gmail.com", Phonenumber: "0657412369", Metamaskaddress: "0x89b08eb07278f2568a36e65cabd910ccb022ab1d", RoleID: RefRole})
		//db.Create(&entity.Users{Firstname: "TestFirefox", Lastname: "Suranaree", Email: "Suranaree@gmail.com", Phonenumber: "0998541236", Metamaskaddress: "0xeb1ff86eeeb4d356dec18401cc5657f0a14d9c8c", RoleID: RefRole})


		// //RefServiceType := uint(1)
		// db.Create(&entity.Users{Name: "Jo", Password: "jo123456", Land: "12กท85", RoleID: RefRole,})
		// db.Create(&entity.Users{Name: "Aut", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})

		// สร้าง Province
		// db.Create(&entity.Province{Province: "นครราชสีมา"})
		// db.Create(&entity.Province{Province: "อุบลราชธานี"})
		// db.Create(&entity.Province{Province: "มหาสารคาม"})

		// สร้าง Branch สำหรับทุกจังหวัด โดยใช้ชื่อจังหวัดจาก CSV
		branches := []struct {
			Branch       string
			ProvinceName string
		}{
			// ภาคเหนือ
			{"เมืองเชียงใหม่", "เชียงใหม่"},
			{"เมืองเชียงราย", "เชียงราย"},
			{"เมืองแม่ฮ่องสอน", "แม่ฮ่องสอน"},
			{"เมืองลำปาง", "ลำปาง"},
			{"เมืองลำพูน", "ลำพูน"},
			{"เมืองอุตรดิตถ์", "อุตรดิตถ์"},
			{"เมืองแพร่", "แพร่"},
			{"เมืองน่าน", "น่าน"},
			{"เมืองพะเยา", "พะเยา"},
			{"เมืองสุโขทัย", "สุโขทัย"},
			{"เมืองตาก", "ตาก"},
			{"เมืองกำแพงเพชร", "กำแพงเพชร"},
			{"เมืองพิษณุโลก", "พิษณุโลก"},
			{"เมืองพิจิตร", "พิจิตร"},
			{"เมืองเพชรบูรณ์", "เพชรบูรณ์"},

			// ภาคตะวันออกเฉียงเหนือ
			{"เมืองขอนแก่น", "ขอนแก่น"},
			{"เมืองอุดรธานี", "อุดรธานี"},
			{"เมืองเลย", "เลย"},
			{"เมืองนครราชสีมา", "นครราชสีมา"},
			{"เมืองบุรีรัมย์", "บุรีรัมย์"},
			{"เมืองสุรินทร์", "สุรินทร์"},
			{"เมืองศีขรภูมิ", "ศีขรภูมิ"},
			{"เมืองอุบลราชธานี", "อุบลราชธานี"},
			{"เมืองยโสธร", "ยโสธร"},
			{"เมืองชัยภูมิ", "ชัยภูมิ"},
			{"เมืองอำนาจเจริญ", "อำนาจเจริญ"},
			{"เมืองหนองบัวลำภู", "หนองบัวลำภู"},
			{"เมืองหนองคาย", "หนองคาย"},
			{"เมืองเบื้องกาฬ", "บึงกาฬ"},
			{"เมืองสกลนคร", "สกลนคร"},
			{"เมืองนครพนม", "นครพนม"},
			{"เมืองมุกดาหาร", "มุกดาหาร"},
			{"เมืองร้อยเอ็ด", "ร้อยเอ็ด"},
			{"เมืองกาฬสินธุ์", "กาฬสินธุ์"},
			{"เมืองมหาสารคาม", "มหาสารคาม"},

			// ภาคกลาง
			{"ราชดำเนิน", "กรุงเทพมหานคร"},
			{"เมืองนนทบุรี", "นนทบุรี"},
			{"เมืองปทุมธานี", "ปทุมธานี"},
			{"เมืองพระนครศรีอยุธยา", "พระนครศรีอยุธยา"},
			{"เมืองอ่างทอง", "อ่างทอง"},
			{"เมืองลพบุรี", "ลพบุรี"},
			{"เมืองสิงห์บุรี", "สิงห์บุรี"},
			{"เมืองชัยนาท", "ชัยนาท"},
			{"เมืองสระบุรี", "สระบุรี"},
			{"เมืองนครนายก", "นครนายก"},
			{"เมืองปราจีนบุรี", "ปราจีนบุรี"},
			{"เมืองฉะเชิงเทรา", "ฉะเชิงเทรา"},
			{"เมืองสมุทรปราการ", "สมุทรปราการ"},
			{"เมืองสมุทรสาคร", "สมุทรสาคร"},
			{"เมืองสมุทรสงคราม", "สมุทรสงคราม"},
			{"เมืองนครปฐม", "นครปฐม"},
			{"เมืองกาญจนบุรี", "กาญจนบุรี"},
			{"เมืองราชบุรี", "ราชบุรี"},
			{"เมืองสุพรรณบุรี", "สุพรรณบุรี"},
			{"เมืองนครสวรรค์", "นครสวรรค์"},
			{"เมืองอุทัยธานี", "อุทัยธานี"},

			// ภาคตะวันออก
			{"เมืองชลบุรี", "ชลบุรี"},
			{"เมืองระยอง", "ระยอง"},
			{"เมืองจันทบุรี", "จันทบุรี"},
			{"เมืองตราด", "ตราด"},
			{"เมืองสระแก้ว", "สระแก้ว"},

			// ภาคตะวันตก
			{"เมืองเพชรบุรี", "เพชรบุรี"},
			{"เมืองประจวบคีรีขันธ์", "ประจวบคีรีขันธ์"},

			// ภาคใต้
			{"เมืองชุมพร", "ชุมพร"},
			{"เมืองระนอง", "ระนอง"},
			{"เมืองสุราษฎร์ธานี", "สุราษฎร์ธานี"},
			{"เมืองพังงา", "พังงา"},
			{"เมืองภูเก็ต", "ภูเก็ต"},
			{"เมืองกระบี่", "กระบี่"},
			{"เมืองนครศรีธรรมราช", "นครศรีธรรมราช"},
			{"เมืองตรัง", "ตรัง"},
			{"เมืองพัทลุง", "พัทลุง"},
			{"เมืองสงขลา", "สงขลา"},
			{"เมืองสตูล", "สตูล"},
			{"เมืองยะลา", "ยะลา"},
			{"เมืองปัตตานี", "ปัตตานี"},
			{"เมืองนราธิวาส", "นราธิวาส"},
		}

		// สร้าง Branch ทั้งหมด โดยค้นหา ProvinceID จากชื่อจังหวัด
		for _, branch := range branches {
			var province entity.Province
			if err := db.Where("name_th = ?", branch.ProvinceName).First(&province).Error; err != nil {
				log.Printf("⚠️ Province not found: %s", branch.ProvinceName)
				continue
			}
			db.Create(&entity.Branch{Branch: branch.Branch, ProvinceID: province.ID})
		}

		// สร้าง Time slots
		RefBranch := uint(1)
		db.Create(&entity.Time{Timework: "09:00 - 10:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "10:00 - 11:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "11:00 - 12:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "13:00 - 14:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "14:00 - 15:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "15:00 - 16:00", MaxCapacity: 5, BranchID: RefBranch})

		// RefTimeID := uint(1)
		// RefTimeID1 := uint(6)
		// RefTypeID := uint(2)
		// startTime := time.Date(2029, time.August, 6, 9, 0, 0, 0, time.UTC)
		// db.Create(&entity.Booking{DateBooking: startTime.Format("2006-01-02 15:04:05"), Status: "Process", TimeID: RefTimeID, UserID: RefTimeID, BranchID: RefTimeID, ServiceTypeID: RefTypeID})
		// db.Create(&entity.Booking{DateBooking: startTime.Format("2006-01-02 15:04:05"), Status: "Process", TimeID: RefTimeID1, UserID: RefTypeID, BranchID: RefTypeID, ServiceTypeID: RefTypeID})

		db.Create(&entity.Typetransaction{StatusNameTh: "รอผู้ซื้อ/ผู้ขายตกลง", StatusNameEn: "in_progress"})
		db.Create(&entity.Typetransaction{StatusNameTh: "ถูกยกเลิกหรือหมดอายุ", StatusNameEn: "cancelled"})
		// db.Create(&entity.Typetransaction{StatusNameTh: "รอการชำระเงิน", StatusNameEn: "money_clear"})
		// db.Create(&entity.Typetransaction{StatusNameTh: "หมดอายุ", StatusNameEn: "expired"})
		db.Create(&entity.Typetransaction{StatusNameTh: "กรมที่ดินตรวจสอบแล้ว", StatusNameEn: "DepartmentOfLand-Verify"})

		db.Create(&entity.Typetransaction{StatusNameTh: "อยู่บนเชน", StatusNameEn: "on-chain"})
		db.Create(&entity.Typetransaction{StatusNameTh: "เสร็จสิ้น", StatusNameEn: "completed"})

		// // สร้าง LandProvinces
		// db.Create(&entity.Transaction{LandID: 1, BuyerID: 2, SellerID: 4, TypetransactionID: 1})

		// db.Create(&entity.Landtitle{
		// 	TokenID:            nil,
		// 	IsLocked:           false,
		// 	SurveyNumber:       "5336 IV 8632",
		// 	LandNumber:         "๑๑",
		// 	SurveyPage:         "๙๔๖๑",
		// 	TitleDeedNumber:    "12345",
		// 	Volume:             "10",
		// 	Page:               "20",
		// 	Rai:                5,
		// 	Ngan:               2,
		// 	SquareWa:           50,
		// 	Status_verify:      false,
		// 	ProvinceID:         38,   // Replace with actual ProvinceID
		// 	DistrictID:         537,  // Replace with actual DistrictID
		// 	SubdistrictID:      4320, // Replace with actual SubdistrictID
		// 	LandVerificationID: nil,  // Replace with actual LandVerificationID if available
		// 	UserID:             1,    // Replace with actual UserID
		// 	Uuid:               uuid.New().String(),
		// })

		// db.Create(&entity.Landtitle{
		// 	TokenID:            nil,
		// 	IsLocked:           false,
		// 	SurveyNumber:       "231458 IS 8632",
		// 	LandNumber:         "๓๕",
		// 	SurveyPage:         "๔๓๒",
		// 	TitleDeedNumber:    "5621",
		// 	Volume:             "20",
		// 	Page:               "20",
		// 	Rai:                3,
		// 	Ngan:               2,
		// 	SquareWa:           50,
		// 	Status_verify:      false,
		// 	ProvinceID:         16,   // Replace with actual ProvinceID
		// 	DistrictID:         138,  // Replace with actual DistrictID
		// 	SubdistrictID:      1371, // Replace with actual SubdistrictID
		// 	LandVerificationID: nil,  // Replace with actual LandVerificationID if available
		// 	UserID:             1,    // Replace with actual UserID
		// 	Uuid:               uuid.New().String(),
		// })

		// db.Create(&entity.Landtitle{
		// 	TokenID:            nil,
		// 	IsLocked:           false,
		// 	SurveyNumber:       "25569 IV 23679",
		// 	LandNumber:         "๑๑",
		// 	SurveyPage:         "๙๔๖๑",
		// 	TitleDeedNumber:    "12345",
		// 	Volume:             "10",
		// 	Page:               "20",
		// 	Rai:                2,
		// 	Ngan:               2,
		// 	SquareWa:           50,
		// 	Status_verify:      false,
		// 	ProvinceID:         6,   // Replace with actual ProvinceID
		// 	DistrictID:         87,  // Replace with actual DistrictID
		// 	SubdistrictID:      568, // Replace with actual SubdistrictID
		// 	LandVerificationID: nil, // Replace with actual LandVerificationID if available
		// 	UserID:             1,   // Replace with actual UserID
		// 	Uuid:               uuid.New().String(),
		// })

		// db.Create(&entity.Landtitle{
		// 	TokenID:            nil,
		// 	IsLocked:           false,
		// 	SurveyNumber:       "5236 IV 8632",
		// 	LandNumber:         "๑๑",
		// 	SurveyPage:         "๙๔๖๑",
		// 	TitleDeedNumber:    "12345",
		// 	Volume:             "10",
		// 	Page:               "20",
		// 	Rai:                5,
		// 	Ngan:               2,
		// 	SquareWa:           50,
		// 	Status_verify:      false,
		// 	ProvinceID:         6,   // Replace with actual ProvinceID
		// 	DistrictID:         87,  // Replace with actual DistrictID
		// 	SubdistrictID:      568, // Replace with actual SubdistrictID
		// 	LandVerificationID: nil, // Replace with actual LandVerificationID if available
		// 	UserID:             1,   // Replace with actual UserID
		// 	Uuid:               uuid.New().String(),
		// })

		//db.Create(&entity.RequestBuySell{LandID: 1, BuyerID: 2, SellerID: 3})

		// db.Create(&entity.RequestBuySell{LandID: 1, BuyerID: 3, SellerID: 4, RequestBuySellTypeID: 1})
		// db.Create(&entity.RequestBuySell{LandID: 2, BuyerID: 2, SellerID: 4, RequestBuySellTypeID: 1})
		// db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 4, SellerID: 2, RequestBuySellTypeID: 1})
		// db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 4, SellerID: 3, RequestBuySellTypeID: 1})

		// ✅ Seed States
		db.Create(&entity.State{Name: "รอตรวจสอบ", Color: "orange"})
		db.Create(&entity.State{Name: "กำลังดำเนินการ", Color: "blue"})
		db.Create(&entity.State{Name: "เสร็จสิ้น", Color: "green"})

		// log.Println("✅ States have been seeded successfully")

		// ✅ Seed Petition
		// db.Create(&entity.Petition{
		// 	FirstName:   "มาลี",
		// 	LastName:    "มาดี",
		// 	Tel:         "0987654321",
		// 	Email:       "j@gmail.com",
		// 	Description: "โฉนดเก่าหาย",
		// 	Date:        "2025-07-31",
		// 	Topic:       "ขอคัดสำเนาโฉนด",
		// 	StateID:     1,
		// 	UserID:      1,
		// })
		// log.Println("✅ Petition created successfully")

		// ✅ Seed Tags
		db.Create(&entity.Tag{Tag: "ติดถนน"})
		db.Create(&entity.Tag{Tag: "ติดทะเล"})
		db.Create(&entity.Tag{Tag: "ติดแม่น้ำ"})
		db.Create(&entity.Tag{Tag: "ใกล้BTS"})
		db.Create(&entity.Tag{Tag: "ใกล้MRT"})
		db.Create(&entity.Tag{Tag: "ติดภูเขา"})

		// log.Println("✅ Tags have been inserted successfully")

		// ✅ Seed Landpost
		// post := entity.Landsalepost{
		// 	FirstName:     "มาลี",
		// 	LastName:      "มาดี",
		// 	PhoneNumber:   "0987654321",
		// 	Name:          "สวนคุณตา",
		// 	Price:         120000,
		// 	ProvinceID:    12,
		// 	DistrictID:    144,
		// 	SubdistrictID: 1077,
		// 	LandID:        1,
		// 	UserID:        1,
		// }
		// db.Create(&post)

		// // เพิ่มรูปภาพ (Photoland)
		// // photos := []entity.Photoland{
		// // 	{Path: "https://backside.legardy.com/uploads/1_3bf04b6ebb.png", LandsalepostID: 1},
		// // 	{Path: "https://backside.legardy.com/uploads/2_abc123.png", LandsalepostID: 1},
		// // }
		// // for _, photo := range photos {
		// // 	db.Create(&photo)
		// // }

		// var tags []entity.Tag
		// if err := db.Where("id IN ?", []uint{1, 4, 5}).Find(&tags).Error; err != nil {
		// 	log.Fatal("❌ Failed to find tags:", err)
		// }
		// if err := db.Model(&post).Association("Tags").Replace(&tags); err != nil {
		// 	log.Fatal("❌ Failed to associate tags:", err)
		// }
		// log.Println("✅ Landpost with tags created successfully")

		// db.Create(&entity.Transaction{
		// 	Amount:         1500,
		// 	BuyerAccepted:  true,
		// 	SellerAccepted: true,
		// 	//MoneyChecked:           false,
		// 	LandDepartmentApproved: false,
		// 	//Expire:                 time.Now().AddDate(0, 0, 7),
		// 	TypetransactionID: 1,
		// 	BuyerID:           3,
		// 	SellerID:          2,
		// 	LandID:            2,
		// 	// TxHash:            nil,
		// })

		// db.Create(&entity.Transaction{
		// 	Amount:         15000,
		// 	BuyerAccepted:  true,
		// 	SellerAccepted: true,
		// 	//MoneyChecked:           true,
		// 	LandDepartmentApproved: true,
		// 	//Expire:                 time.Now().AddDate(0, 0, 7),
		// 	TypetransactionID: 2,
		// 	BuyerID:           2,
		// 	SellerID:          3,
		// 	LandID:            2,
		// 	// TxHash:            nil,
		// })

		// db.Create(&entity.Roomchat{User1ID: 3, User2ID: 1})
		// db.Create(&entity.Roomchat{User1ID: 3, User2ID: 2})

		// db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 4, SellerID: 2, RequestBuySellTypeID: 1})
		// db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 4, SellerID: 3, RequestBuySellTypeID: 1})
		// db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 1, SellerID: 2})
		// db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 2, SellerID: 3})
		// 🔸 สร้าง Roomchat หลังจากสร้าง Landsalepost แล้ว
		// createRoomchatsAndMessages()
	}

	// log.Println("✅ Database Migrated & Seeded Successfully")

} // <<<<<<<<<<<<<< ปิดฟังก์ชัน SetupDatabase()
// แยกการสร้าง Roomchat และ Message ออกมาเป็น function แยก
// func createRoomchatsAndMessages() {
// 	var post entity.Landsalepost
// 	if err := db.Where("num_of_land_title = ?", "180").First(&post).Error; err != nil {
// 		log.Println("❌ Cannot find Landsalepost with num_of_land_title = 180")
// 		return
// 	}

// 	// รายชื่อผู้ใช้ที่ต้องการสร้างห้องแชท
// 	userIDs := []uint{2, 3}

// 	for _, userID := range userIDs {
// 		// เช็คว่ามี Roomchat นี้อยู่แล้วหรือยัง
// 		var existingRoomchat entity.Roomchat
// 		err := db.Where("landsalepost_id = ? AND user_id = ?", post.ID, userID).First(&existingRoomchat).Error
// 		if err == nil {
// 			log.Println("⚠️ Roomchat already exists for UserID:", userID)
// 			continue
// 		}

// 		// สร้าง Roomchat ใหม่
// 		// 	roomchat := entity.Roomchat{
// 		// 		LandsalepostID: post.ID,
// 		// 		UserID:         userID,
// 		// 	}

// 		// 	if err := db.Create(&roomchat).Error; err != nil {
// 		// 		log.Println("❌ Failed to create Roomchat for user", userID, ":", err)
// 		// 		continue
// 		// 	}
// 		// 	log.Println("✅ Created Roomchat for UserID:", userID, "RoomchatID:", roomchat.ID)

// 		// 	// เพิ่มข้อความตัวอย่างในห้องแชท
// 		// 	messages := []entity.Message{
// 		// 		{
// 		// 			Message:    "สวัสดีครับ สนใจที่ดินแปลงนี้ไหม?",
// 		// 			Time:       time.Now(),
// 		// 			RoomchatID: roomchat.ID,
// 		// 		},
// 		// 		{
// 		// 			Message:    "สนใจครับ อยากทราบรายละเอียดเพิ่มเติม",
// 		// 			Time:       time.Now().Add(1 * time.Minute),
// 		// 			RoomchatID: roomchat.ID,
// 		// 		},
// 		// 		{
// 		// 			Message:    "ที่ดินขนาด 5 ไร่ ราคา 2 ล้านบาทครับ",
// 		// 			Time:       time.Now().Add(2 * time.Minute),
// 		// 			RoomchatID: roomchat.ID,
// 		// 		},
// 		// 	}

// 		// 	if err := db.Create(&messages).Error; err != nil {
// 		// 		log.Println("❌ Failed to create messages for UserID:", userID, ":", err)
// 		// 	} else {
// 		// 		log.Println("✅ Created messages for UserID:", userID)
// 		// 	}
// 	}

// 	log.Println("✅ Database Migrated & Seeded Successfully")

// 	// ✅ Seed State (แยกจาก Users)
// 	// var stateCount int64
// 	// db.Model(&entity.State{}).Count(&stateCount)
// 	// if stateCount == 0 {
// 	// 	db.Create(&entity.State{Name: "รอตรวจสอบ", Color: "orange"})
// 	// 	db.Create(&entity.State{Name: "กำลังดำเนินการ", Color: "blue"})
// 	// 	db.Create(&entity.State{Name: "เสร็จสิ้น", Color: "green"})
// 	// }

// 	// log.Println("✅ Database Migrated & Seeded Successfully")

// }
func ImportProvincesCSV(db *gorm.DB, filePath string) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatalf("❌ Open file error: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatalf("❌ Read CSV error: %v", err)
	}

	if len(records) <= 1 {
		log.Println("⚠️ No data found")
		return
	}

	for i, row := range records {
		if i == 0 {
			log.Printf("🔍 Header: %+v", row)
			continue
		}
		if len(row) < 3 {
			log.Printf("⚠️ Skipped row %d: %+v (too few columns)", i, row)
			continue
		}

		province := entity.Province{
			NameTH: row[1],
			NameEN: row[2],
		}
		db.Where("name_th = ?", province.NameTH).FirstOrCreate(&province)
	}
	log.Println("✅ Provinces imported")
}

func ImportDistrictsCSV(db *gorm.DB, filePath string) {
	file, _ := os.Open(filePath)
	defer file.Close()
	reader := csv.NewReader(file)
	records, _ := reader.ReadAll()

	for i, row := range records {
		if i == 0 {
			continue
		}
		provinceID, _ := strconv.Atoi(row[1])
		district := entity.District{
			NameTH:     row[2],
			NameEN:     row[3],
			ProvinceID: uint(provinceID),
		}
		db.FirstOrCreate(&district, entity.District{NameTH: district.NameTH, ProvinceID: district.ProvinceID})
	}
	log.Println("✅ Districts imported")
}

func ImportSubDistrictsCSV(db *gorm.DB, filePath string) {
	file, _ := os.Open(filePath)
	defer file.Close()
	reader := csv.NewReader(file)
	records, _ := reader.ReadAll()

	for i, row := range records {
		if i == 0 {
			continue
		}
		districtID, _ := strconv.Atoi(row[1])
		subDistrict := entity.Subdistrict{
			NameTH:     row[2],
			NameEN:     row[3],
			DistrictID: uint(districtID),
		}
		db.FirstOrCreate(&subDistrict, entity.Subdistrict{NameTH: subDistrict.NameTH, DistrictID: subDistrict.DistrictID})
	}
	log.Println("✅ SubDistricts imported")

}
