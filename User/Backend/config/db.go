package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"landchain/entity"
	"log"
	"os"
	"time"

	"encoding/csv"
	"strconv"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

	// DSN
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
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

func SeedGeographiesFromJSON(db *gorm.DB, jsonPath string) error {
	// เปิดไฟล์ JSON
	var err error
	if err != nil {
		return fmt.Errorf("cannot open geography JSON: %w", err)
	}
	file, err := os.Open(jsonPath)
	if err != nil {
		return fmt.Errorf("cannot open geography JSON: %w", err)
	}
	defer file.Close()

	// อ่านไฟล์
	bytes, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("cannot read geography JSON: %w", err)
	}

	// แปลง JSON เป็น slice ของ LandGeographies
	var geographies []entity.LandGeographies
	if err := json.Unmarshal(bytes, &geographies); err != nil {
		return fmt.Errorf("cannot unmarshal geography JSON: %w", err)
	}

	// เริ่ม transaction
	tx := db.Begin()
	for _, geo := range geographies {
		// เพิ่มข้อมูล ถ้ามี conflict ให้ข้าม
		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&geo).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("cannot create geography: %w", err)
		}
	}
	return tx.Commit().Error
}

func SeedGeographyExample(db *gorm.DB) {
	// เปิดไฟล์ JSON
	jsonFile, err := os.Open("ProvincesData/thai_geographies.json")
	if err != nil {
		log.Fatalf("cannot open provinces JSON: %v", err)
	}
	defer jsonFile.Close()

	// อ่านข้อมูล
	byteValue, _ := io.ReadAll(jsonFile)

	// แปลง JSON → struct
	var geographies []entity.LandGeographies
	if err := json.Unmarshal(byteValue, &geographies); err != nil {
		log.Fatalf("cannot unmarshal provinces JSON: %v", err)
	}

	// Insert ลง DB
	for _, geography := range geographies {
		if err := db.Create(&geography).Error; err != nil {
			fmt.Printf("❌ Failed to insert province %s: %v\n", geography.Name, err)
		}
	}
}

// ------------------ Seed Provinces ------------------
func SeedProvinces(db *gorm.DB) {
	// เปิดไฟล์ JSON
	jsonFile, err := os.Open("ProvincesData/thai_provinces.json")
	if err != nil {
		log.Fatalf("cannot open provinces JSON: %v", err)
	}
	defer jsonFile.Close()

	// อ่านข้อมูล
	byteValue, _ := io.ReadAll(jsonFile)

	// แปลง JSON → struct
	var provinces []entity.LandProvinces
	if err := json.Unmarshal(byteValue, &provinces); err != nil {
		log.Fatalf("cannot unmarshal provinces JSON: %v", err)
	}

	// Insert ลง DB
	for _, province := range provinces {
		if err := db.Create(&province).Error; err != nil {
			fmt.Printf("❌ Failed to insert province %s: %v\n", province.NameTh, err)
		}
	}
}

func SeedAmphures(db *gorm.DB) {
	// เปิดไฟล์ JSON
	jsonFile, err := os.Open("ProvincesData/thai_amphures.json")
	if err != nil {
		log.Fatalf("cannot open amphures JSON: %v", err)
	}
	defer jsonFile.Close()

	// อ่านข้อมูล
	byteValue, _ := ioutil.ReadAll(jsonFile)

	// แปลง JSON → struct
	var amphures []entity.LandAmphures
	if err := json.Unmarshal(byteValue, &amphures); err != nil {
		log.Fatalf("cannot unmarshal amphures JSON: %v", err)
	}

	// Insert ลง DB
	for _, amphure := range amphures {
		if err := db.Create(&amphure).Error; err != nil {
			fmt.Printf("❌ Failed to insert amphure %s: %v\n", amphure.NameTh, err)
		}
	}
}

func SeedTambons(db *gorm.DB) {
	// เปิดไฟล์ JSON
	jsonFile, err := os.Open("ProvincesData/thai_tambons.json")
	if err != nil {
		log.Fatalf("cannot open tambons JSON: %v", err)
	}
	defer jsonFile.Close()

	// อ่านข้อมูล
	byteValue, _ := ioutil.ReadAll(jsonFile)

	// แปลง JSON → struct
	var tambons []entity.LandTambons
	if err := json.Unmarshal(byteValue, &tambons); err != nil {
		log.Fatalf("cannot unmarshal tambons JSON: %v", err)
	}

	// Insert ลง DB
	for _, tambon := range tambons {
		if err := db.Create(&tambon).Error; err != nil {
			fmt.Printf("❌ Failed to insert tambon %s: %v\n", tambon.NameTh, err)
		}
	}
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

		&entity.LandGeographies{},
		&entity.LandProvinces{},
		&entity.ServiceType{},
		&entity.LandAmphures{},
		&entity.LandTambons{},
		&entity.Landtitle{}, // ✅ ต้องมาก่อน RequestBuy/Sell

		&entity.LandVerification{}, /////
		&entity.Landtitle{},

		&entity.Landsalepost{},
		&entity.Transaction{},
		&entity.Photoland{},
		&entity.Roomchat{},
		&entity.Message{},
		&entity.Copyrequest{},
		&entity.Petition{},
		&entity.State{},
		&entity.Location{},

		&entity.LandGeographies{},
		&entity.LandProvinces{},
		&entity.ServiceType{},
		&entity.LandAmphures{},
		&entity.LandTambons{},
		&entity.Landtitle{},
		&entity.RequestBuySellType{},
		&entity.RequestBuySell{},
		&entity.Tag{},
		&entity.District{},
		&entity.Subdistrict{},
		&entity.Nonce{},
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
		db.Create(&entity.ServiceType{Service: "ขึ้นทะเบียนที่ดิน"})
		db.Create(&entity.ServiceType{Service: "ลงทะเบียนชื่อผู้ใช้"})
	}

	if count == 0 {
		// สร้าง Role
		db.Create(&entity.Role{Role: "User"})
		db.Create(&entity.Role{Role: "Admin"})

		RefRole := uint(1)

		db.Create(&entity.Users{Firstname: "Rattapon", Lastname: "Phonthaisong", Email: "ponthaisongfc@gmail.com", Phonenumber: "0555555555", Metamaskaddress: "0xBfa3668b4A0A4593904427F777C9343bBd5f469a", RoleID: RefRole}) // db.Create(&entity.Users{Name: "Aut", Email: "@goods", Phonenumber: "0912345679", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})
		db.Create(&entity.Users{Firstname: "Panachai", Lastname: "Potisuwan", Email: "Panachai@gmail.com", Phonenumber: "0555555554", Metamaskaddress: "0xBfa3668b4A0A4593904427F777C9343bBd5f4444", RoleID: RefRole})
		db.Create(&entity.Users{Firstname: "Noth", Lastname: "Potisuwan", Email: "Noth@gmail.com", Phonenumber: "0555555556", Metamaskaddress: "0xBfa3668b4A0A4593904427F777C9343bBd5f6666", RoleID: RefRole})

		// //RefServiceType := uint(1)
		// db.Create(&entity.Users{Name: "Jo", Password: "jo123456", Land: "12กท85", RoleID: RefRole,})
		// db.Create(&entity.Users{Name: "Aut", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})

		// สร้าง Province
		// db.Create(&entity.Province{Province: "นครราชสีมา"})
		// db.Create(&entity.Province{Province: "อุบลราชธานี"})
		// db.Create(&entity.Province{Province: "มหาสารคาม"})

		RefProvince := uint(23)
		RefProvince1 := uint(19)
		db.Create(&entity.Branch{Branch: "น้ำยืน", ProvinceID: RefProvince})
		db.Create(&entity.Branch{Branch: "เมืองนครราขสีมา", ProvinceID: RefProvince1})

		// สร้าง Time slots
		RefBranch := uint(1)
		db.Create(&entity.Time{Timework: "09:00 - 10:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "10:00 - 11:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "11:00 - 12:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "13:00 - 14:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "14:00 - 15:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "15:00 - 16:00", MaxCapacity: 5, BranchID: RefBranch})

		RefTimeID := uint(1)
		RefTimeID1 := uint(6)
		RefTypeID := uint(2)
		startTime := time.Date(2025, time.August, 6, 9, 0, 0, 0, time.UTC)
		db.Create(&entity.Booking{DateBooking: startTime.Format("2006-01-02 15:04:05"), Status: "Process", TimeID: RefTimeID, UserID: RefTimeID, BranchID: RefTimeID, ServiceTypeID: RefTypeID})
		db.Create(&entity.Booking{DateBooking: startTime.Format("2006-01-02 15:04:05"), Status: "Process", TimeID: RefTimeID1, UserID: RefTypeID, BranchID: RefTypeID, ServiceTypeID: RefTypeID})

		SeedGeographyExample(db)
		SeedProvinces(db)
		SeedAmphures(db)
		SeedTambons(db)

		db.Create(&entity.Typetransaction{StatusNameTh: "รอผู้ซื้อ/ผู้ขายตกลง", StatusNameEn: "in_progress"})
		db.Create(&entity.Typetransaction{StatusNameTh: "เสร็จสิ้น", StatusNameEn: "completed"})
		db.Create(&entity.Typetransaction{StatusNameTh: "ถูกยกเลิกโดยผู้ซื้อหรือผู้ขาย", StatusNameEn: "cancelled"})
		db.Create(&entity.Typetransaction{StatusNameTh: "หมดอายุ", StatusNameEn: "expired"})

		db.Create(&entity.RequestBuySellType{StatusNameTh: "เจ้าของโฉลดสร้างคำขอขาย", StatusNameEn: "pending"})
		db.Create(&entity.RequestBuySellType{StatusNameTh: "ตกลงซื้อขาย", StatusNameEn: "accepted"})
		db.Create(&entity.RequestBuySellType{StatusNameTh: "ปฏิเสธคำขอ", StatusNameEn: "rejected"})
		db.Create(&entity.RequestBuySellType{StatusNameTh: "ยกเลิก", StatusNameEn: "cancelled"})

		// // สร้าง LandProvinces
		db.Create(&entity.Transaction{LandID: 1, BuyerID: 2, SellerID: 4, TypetransactionID: 1})

		db.Create(&entity.Landtitle{
			TokenID:            0,
			IsLocked:           false,
			SurveyNumber:       "5336 IV 8632",
			LandNumber:         "๑๑",
			SurveyPage:         "๙๔๖๑",
			TitleDeedNumber:    "12345",
			Volume:             "10",
			Page:               "20",
			Rai:                5,
			Ngan:               2,
			SquareWa:           50,
			Status:             "Process",
			GeographyID:        nil, // Replace with actual GeographyID if available
			ProvinceID:         1,   // Replace with actual ProvinceID
			DistrictID:         1,   // Replace with actual DistrictID
			SubdistrictID:      1,   // Replace with actual SubdistrictID
			LandVerificationID: nil, // Replace with actual LandVerificationID if available
			UserID:             1,   // Replace with actual UserID
		})

		db.Create(&entity.Landtitle{
			TokenID:            1,
			IsLocked:           false,
			SurveyNumber:       "5336 IV 8632",
			LandNumber:         "๑๑",
			SurveyPage:         "๙๔๖๑",
			TitleDeedNumber:    "12345",
			Volume:             "10",
			Page:               "20",
			Rai:                5,
			Ngan:               2,
			SquareWa:           50,
			Status:             "Process",
			GeographyID:        nil, // Replace with actual GeographyID if available
			ProvinceID:         2,   // Replace with actual ProvinceID
			DistrictID:         1,   // Replace with actual DistrictID
			SubdistrictID:      1,   // Replace with actual SubdistrictID
			LandVerificationID: nil, // Replace with actual LandVerificationID if available
			UserID:             1,   // Replace with actual UserID
		})

		db.Create(&entity.Landtitle{
			TokenID:            2,
			IsLocked:           false,
			SurveyNumber:       "5336 IV 8632",
			LandNumber:         "๑๑",
			SurveyPage:         "๙๔๖๑",
			TitleDeedNumber:    "12345",
			Volume:             "10",
			Page:               "20",
			Rai:                5,
			Ngan:               2,
			SquareWa:           50,
			Status:             "Process",
			GeographyID:        nil, // Replace with actual GeographyID if available
			ProvinceID:         3,   // Replace with actual ProvinceID
			DistrictID:         1,   // Replace with actual DistrictID
			SubdistrictID:      1,   // Replace with actual SubdistrictID
			LandVerificationID: nil, // Replace with actual LandVerificationID if available
			UserID:             1,   // Replace with actual UserID
		})

		db.Create(&entity.RequestBuySell{LandID: 1, BuyerID: 2, SellerID: 4, RequestBuySellTypeID: 1})
		db.Create(&entity.RequestBuySell{LandID: 1, BuyerID: 3, SellerID: 4, RequestBuySellTypeID: 1})
		db.Create(&entity.RequestBuySell{LandID: 2, BuyerID: 2, SellerID: 4, RequestBuySellTypeID: 1})
		db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 4, SellerID: 2, RequestBuySellTypeID: 1})
		db.Create(&entity.RequestBuySell{LandID: 3, BuyerID: 4, SellerID: 3, RequestBuySellTypeID: 1})
		// 🔸 สร้าง Roomchat หลังจากสร้าง Landsalepost แล้ว
		createRoomchatsAndMessages()
	}

	log.Println("✅ Database Migrated & Seeded Successfully")

	states := []entity.State{
		{Name: "รอตรวจสอบ", Color: "orange"},
		{Name: "กำลังดำเนินการ", Color: "blue"},
		{Name: "เสร็จสิ้น", Color: "green"},
	}

	for _, s := range states {
		var exist entity.State
		if err := db.Where("name = ?", s.Name).First(&exist).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// ✅ ถ้าไม่เจอค่อยสร้างใหม่
				if err := db.Create(&s).Error; err != nil {
					log.Fatal("❌ Failed to create state:", err)
				}
			} else {
				log.Fatal("❌ Failed to query state:", err)
			}
		}
	}

	log.Println("✅ States have been seeded successfully")

	// สร้าง Petition
	petition := entity.Petition{
		FirstName:   "มาลี",
		LastName:    "มาดี",
		Tel:         "0987654321",
		Email:       "j@gmail.com",
		Description: "โฉนดเก่าหาย",
		Date:        "2025-07-31",
		Topic:       "ขอคัดสำเนาโฉนด",
		StateID:     1,
		UserID:      1,
	}

	if err := db.Create(&petition).Error; err != nil {
		log.Fatal("❌ Failed to create petition:", err)
	}

	log.Println("✅ Petition created successfully")

	tags := []entity.Tag{
		{Tag: "ติดถนน"},
		{Tag: "ติดทะเล"},
		{Tag: "ติดแม่น้ำ"},
		{Tag: "ใกล้BTS"},
		{Tag: "ใกล้MRT"},
		{Tag: "ติดภูเขา"},
	}
	// เพิ่ม tags ลงในฐานข้อมูล
	if err := db.Create(&tags).Error; err != nil {
		log.Fatal("Error inserting tags:", err)
	}

	// แสดงผลการบันทึกข้อมูล
	fmt.Println("Tags have been inserted successfully")

	//postlad
	landpost := entity.Landsalepost{
		FirstName:     "มาลี",
		LastName:      "มาดี",
		PhoneNumber:   "0987654321",
		Image:         "j@gmail.com",
		Name:          "สวนคุณตา",
		Price:         120000,
		TagID:         1,
		ProvinceID:    20,
		DistrictID:    1,
		SubdistrictID: 1,
		//Map: 		"aaa",
		LandID: 1,
		UserID: 1,
	}

	if err := db.Create(&landpost).Error; err != nil {
		log.Fatal("❌ Failed to create petition:", err)
	}

	log.Println("✅ Landpost created successfully")

} // <<<<<<<<<<<<<< ปิดฟังก์ชัน SetupDatabase()
// แยกการสร้าง Roomchat และ Message ออกมาเป็น function แยก
func createRoomchatsAndMessages() {
	var post entity.Landsalepost
	if err := db.Where("num_of_land_title = ?", "180").First(&post).Error; err != nil {
		log.Println("❌ Cannot find Landsalepost with num_of_land_title = 180")
		return
	}

	// รายชื่อผู้ใช้ที่ต้องการสร้างห้องแชท
	userIDs := []uint{2, 3}

	for _, userID := range userIDs {
		// เช็คว่ามี Roomchat นี้อยู่แล้วหรือยัง
		var existingRoomchat entity.Roomchat
		err := db.Where("landsalepost_id = ? AND user_id = ?", post.ID, userID).First(&existingRoomchat).Error
		if err == nil {
			log.Println("⚠️ Roomchat already exists for UserID:", userID)
			continue
		}

		// สร้าง Roomchat ใหม่
		// 	roomchat := entity.Roomchat{
		// 		LandsalepostID: post.ID,
		// 		UserID:         userID,
		// 	}

		// 	if err := db.Create(&roomchat).Error; err != nil {
		// 		log.Println("❌ Failed to create Roomchat for user", userID, ":", err)
		// 		continue
		// 	}
		// 	log.Println("✅ Created Roomchat for UserID:", userID, "RoomchatID:", roomchat.ID)

		// 	// เพิ่มข้อความตัวอย่างในห้องแชท
		// 	messages := []entity.Message{
		// 		{
		// 			Message:    "สวัสดีครับ สนใจที่ดินแปลงนี้ไหม?",
		// 			Time:       time.Now(),
		// 			RoomchatID: roomchat.ID,
		// 		},
		// 		{
		// 			Message:    "สนใจครับ อยากทราบรายละเอียดเพิ่มเติม",
		// 			Time:       time.Now().Add(1 * time.Minute),
		// 			RoomchatID: roomchat.ID,
		// 		},
		// 		{
		// 			Message:    "ที่ดินขนาด 5 ไร่ ราคา 2 ล้านบาทครับ",
		// 			Time:       time.Now().Add(2 * time.Minute),
		// 			RoomchatID: roomchat.ID,
		// 		},
		// 	}

		// 	if err := db.Create(&messages).Error; err != nil {
		// 		log.Println("❌ Failed to create messages for UserID:", userID, ":", err)
		// 	} else {
		// 		log.Println("✅ Created messages for UserID:", userID)
		// 	}
	}

	log.Println("✅ Database Migrated & Seeded Successfully")

	// ✅ Seed State (แยกจาก Users)
	// var stateCount int64
	// db.Model(&entity.State{}).Count(&stateCount)
	// if stateCount == 0 {
	// 	db.Create(&entity.State{Name: "รอตรวจสอบ", Color: "orange"})
	// 	db.Create(&entity.State{Name: "กำลังดำเนินการ", Color: "blue"})
	// 	db.Create(&entity.State{Name: "เสร็จสิ้น", Color: "green"})
	// }

	// log.Println("✅ Database Migrated & Seeded Successfully")

}
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