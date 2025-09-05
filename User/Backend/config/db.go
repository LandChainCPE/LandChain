package config

import (
	"encoding/csv"
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"landchain/entity"

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

	// เชื่อมต่อ DB
	connection, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect database:", err)
	}

	db = connection // ✅ เก็บไว้ใน global variable
	log.Println("✅ Database Connected")
	return db
}

// ✅ SetupDatabase: AutoMigrate และ Seed ข้อมูลเริ่มต้น
func SetupDatabase() {
	if db == nil {
		log.Fatal("❌ Database connection not initialized. Please call ConnectDatabase() first.")
	}

	// Import CSV
	ImportProvincesCSV(db, "./config/data/address/provinces.csv")
	ImportDistrictsCSV(db, "./config/data/address/districts.csv")
	ImportSubDistrictsCSV(db, "./config/data/address/subdistricts.csv")

	// AutoMigrate
	if err := db.AutoMigrate(
		&entity.Role{},
		&entity.Users{},
		&entity.Time{},
		&entity.Province{},
		&entity.Branch{},
		&entity.Booking{},
		&entity.Typetransaction{},
		&entity.Landtitle{},
		&entity.Landsalepost{},
		&entity.Transaction{},
		&entity.Photoland{},
		&entity.Roomchat{},
		&entity.Message{},
		&entity.Copyrequest{},
		&entity.LandProvinces{},
		&entity.ServiceType{},
		&entity.Petition{},
		&entity.State{},
		&entity.Location{},
		&entity.District{},
		&entity.Subdistrict{},
		&entity.Verification{},
		&entity.VerificationEvent{},
	); err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}

	// Seed Data
	var count int64
	db.Model(&entity.Users{}).Count(&count)

	// สร้าง ServiceType ก่อน
	var serviceCount int64
	db.Model(&entity.ServiceType{}).Count(&serviceCount)
	if serviceCount == 0 {
		db.Create(&entity.ServiceType{Service: "ขึ้นทะเบียนที่ดิน"})
	}

	if count == 0 {
		// สร้าง Role
		db.Create(&entity.Role{Role: "User"})
		db.Create(&entity.Role{Role: "Admin"})

		RefRole := uint(1)
		db.Create(&entity.Users{
			Firstname:      "Rattapon",
			Lastname:       "Phonthaisong",
			Email:          "ponthaisongfc@gmail.com",
			Phonenumber:    "0555555555",
			Metamaskaddress: "0xBfa3668b4A0A4593904427F777C9343bBd5f469a",
			RoleID:         RefRole,
		})

		// สร้าง Province
		db.Create(&entity.Province{Province: "นครราชสีมา"})
		db.Create(&entity.Province{Province: "อุบลราชธานี"})
		db.Create(&entity.Province{Province: "มหาสารคาม"})

		RefProvince := uint(2)
		db.Create(&entity.Branch{Branch: "น้ำยืน", ProvinceID: RefProvince})

		// สร้าง Time slots
		RefBranch := uint(1)
		db.Create(&entity.Time{Timework: "09:00 - 10:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "10:00 - 11:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "11:00 - 12:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "13:00 - 14:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "14:00 - 15:00", MaxCapacity: 5, BranchID: RefBranch})
		db.Create(&entity.Time{Timework: "15:00 - 16:00", MaxCapacity: 5, BranchID: RefBranch})

		// สร้าง LandProvinces
		var provinces = []string{
			"กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
			"ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
			"ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
			"ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
			"นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
			"น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
			"ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พังงา", "พัทลุง",
			"พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่",
			"พะเยา", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
			"ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง",
			"ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
			"ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
			"สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
			"สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
			"หนองบัวลำภู", "อ่างทอง", "อุดรธานี", "อุทัยธานี", "อุตรดิตถ์",
			"อุบลราชธานี", "อำนาจเจริญ",
		}

		var landProvinceCount int64
		db.Model(&entity.LandProvinces{}).Count(&landProvinceCount)
		if landProvinceCount == 0 {
			for _, name := range provinces {
				db.Create(&entity.LandProvinces{Name: name})
			}
		}

		// 🔸 ตรวจสอบและสร้าง Landtitle ถ้ายังไม่มี
		var landtitle1, landtitle2 entity.Landtitle

		// ใช้เวลาเดียวกันเป็นค่าเริ่มต้นให้ StatusUpdatedAt
		now := time.Now()

		// ตัวอย่างกำหนด Province/District/Subdistrict เป็น 1 ทั้งหมด
		defaultProvinceID := uint(1)
		defaultDistrictID := uint(1)
		defaultSubdistrictID := uint(1)

		// โฉนดชุดแรก
		if err := db.
			Where("deed_number = ? AND deleted_at IS NULL", "000008-180").
			First(&landtitle1).Error; err != nil {

			if errors.Is(err, gorm.ErrRecordNotFound) {
				landtitle1 = entity.Landtitle{
					DeedNumber: "000008-180",
					VillageNo:  "5",
					Soi:        "ซอยตัวอย่าง 1",
					Road:       "ถนนตัวอย่าง 1",

					Rai:      1,
					Ngan:     2,
					SquareWa: 30,

					DeedImagePath: "",

					UserID:        1,
					ProvinceID:    defaultProvinceID,
					DistrictID:    defaultDistrictID,
					SubdistrictID: defaultSubdistrictID,

					Status:          "PENDING",
					StatusUpdatedAt: &now,
				}
				if err := db.Create(&landtitle1).Error; err != nil {
					log.Println("❌ Create landtitle1 failed:", err)
				}
			} else {
				log.Println("❌ Query landtitle1 failed:", err)
			}
		}

		// โฉนดชุดสอง
		if err := db.
			Where("deed_number = ? AND deleted_at IS NULL", "000009-264").
			First(&landtitle2).Error; err != nil {

			if errors.Is(err, gorm.ErrRecordNotFound) {
				landtitle2 = entity.Landtitle{
					DeedNumber: "000009-264",
					VillageNo:  "7",
					Soi:        "ซอยสุขใจ",
					Road:       "ถนนบางนา-ตราด",

					Rai:      2,
					Ngan:     1,
					SquareWa: 12,

					DeedImagePath: "",

					UserID:        1,
					ProvinceID:    defaultProvinceID,
					DistrictID:    defaultDistrictID,
					SubdistrictID: defaultSubdistrictID,

					Status:          "PENDING",
					StatusUpdatedAt: &now,
				}
				if err := db.Create(&landtitle2).Error; err != nil {
					log.Println("❌ Create landtitle2 failed:", err)
				}
			} else {
				log.Println("❌ Query landtitle2 failed:", err)
			}
		}

		// ===== ส่วนนี้ถ้ายังไม่ใช้ เก็บไว้คอมเมนต์ได้ =====
		// // 🔸 ตรวจสอบและสร้าง Landsalepost ถ้ายังไม่มี
		// var post1, post2 entity.Landsalepost
		// ...
		// createRoomchatsAndMessages()
		// ===== สิ้นสุดส่วนคอมเมนต์ =====
	} // <<<<<<<<<<<<<< ปิด if count == 0

	log.Println("✅ Database Migrated & Seeded Successfully")
} // <<<<<<<<<<<<<< ปิดฟังก์ชัน SetupDatabase()
// // แยกการสร้าง Roomchat และ Message ออกมาเป็น function แยก (ยังไม่ใช้ก็เว้นไว้ได้)
// func createRoomchatsAndMessages() { ... }
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

func StartUserVerify(db *gorm.DB, userID, requestedBy uint) (*entity.Verification, error) {
	v := &entity.Verification{
		SubjectID:         userID,
		SubjectType:       entity.SubjectUserIdentity,
		Status:            entity.StatusPending,
		RequestedByUserID: &requestedBy,
	}
	return v, db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(v).Error; err != nil {
			return err
		}
		e := entity.VerificationEvent{VerificationID: v.ID, ToStatus: entity.StatusPending}
		return tx.Create(&e).Error
	})
}

func UpdateVerificationStatus(db *gorm.DB, verID uint, to entity.VerificationStatus, changedBy *uint, reason *string) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var v entity.Verification
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&v, verID).Error; err != nil {
			return err
		}

		from := v.Status
		v.Status = to
		if err := tx.Save(&v).Error; err != nil {
			return err
		}

		ev := entity.VerificationEvent{
			VerificationID:  v.ID,
			FromStatus:      &from,
			ToStatus:        to,
			ChangedByUserID: changedBy,
			Reason:          reason,
		}
		if err := tx.Create(&ev).Error; err != nil {
			return err
		}

		// อัปเดตฟิลด์สรุปที่ Users/Landtitle (denormalized)
		switch v.SubjectType {
		case entity.SubjectUserIdentity:
			updates := map[string]any{
				"identity_verification_status": string(v.Status),
			}
			if v.Status == entity.StatusApproved {
				updates["identity_verified_at"] = time.Now()
			}
			if err := tx.Model(&entity.Users{}).
				Where("id = ?", v.SubjectID).
				Updates(updates).Error; err != nil {
				return err
			}
			// case entity.SubjectLandTitleOwnership: ... ทำคล้ายกัน
		}
		return nil
	})
}

