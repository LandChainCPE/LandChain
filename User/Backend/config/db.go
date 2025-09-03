package config

import (
	"errors"
	"fmt"
	"log"
	"os"
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
		db.Create(&entity.Users{Firstname: "Rattapon", Lastname: "Phonthaisong", Email: "ponthaisongfc@gmail.com", Phonenumber: "0555555555", Metamaskaddress: "0xBfa3668b4A0A4593904427F777C9343bBd5f469a", RoleID: RefRole}) // db.Create(&entity.Users{Name: "Aut", Email: "@goods", Phonenumber: "0912345679", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})
		// db.Create(&entity.Users{Name: "Bam", Email: "@goods1", Phonenumber: "0912345677", Password: "1234564", Land: "ผหก5ป58ก", RoleID: RefRole})
		// //RefServiceType := uint(1)
		// db.Create(&entity.Users{Name: "Jo", Password: "jo123456", Land: "12กท85", RoleID: RefRole,})
		// db.Create(&entity.Users{Name: "Aut", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})

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
		// (ถ้าคุณมีข้อมูลจังหวัด/อำเภอ/ตำบลจริงในตาราง ให้เปลี่ยนเป็น ID ที่มีอยู่)
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

					DeedImagePath: "", // ใส่ path ถ้ามีไฟล์สแกน

					UserID:        1,
					ProvinceID:    defaultProvinceID,
					DistrictID:    defaultDistrictID,
					SubdistrictID: defaultSubdistrictID,

					Status:          "PENDING",
					StatusUpdatedAt: &now,

					// Verification เริ่มว่างไว้ก่อน
					// OwnershipVerificationStatus: ptr("PENDING"),
					// OwnershipVerifiedAt:        nil,

					// TokenID เว้นไว้ก่อนจนกว่าจะ mint
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

		// 🔸 ตรวจสอบและสร้าง Landsalepost ถ้ายังไม่มี
		var post1, post2 entity.Landsalepost

		if err := db.Where("num_of_land_title = ?", "180").First(&post1).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				post1 = entity.Landsalepost{
					Name:           "นายสมชาย ใจดี",
					PhoneNumber:    "0812345678",
					NumOfLandTitle: "180",
					AdressLandplot: "ต.ในเมือง อ.เมือง จ.นครราชสีมา",
					Price:          260000.00,
					LandtitleID:    landtitle1.ID,
				}
				db.Create(&post1)
			}
		}

		if err := db.Where("num_of_land_title = ?", "264").First(&post2).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				post2 = entity.Landsalepost{
					Name:           "นางสาววิภา รัตน์เรือง",
					PhoneNumber:    "0898765432",
					NumOfLandTitle: "264",
					AdressLandplot: "ต.หนองจะบก อ.เมือง จ.นครราชสีมา",
					Price:          350000.00,
					LandtitleID:    landtitle2.ID,
				}
				db.Create(&post2)
			}
		}

		// 🔸 สร้าง Roomchat หลังจากสร้าง Landsalepost แล้ว
		createRoomchatsAndMessages()
	}

	log.Println("✅ Database Migrated & Seeded Successfully")
}

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
		roomchat := entity.Roomchat{
			LandsalepostID: post.ID,
			UserID:         userID,
		}

		if err := db.Create(&roomchat).Error; err != nil {
			log.Println("❌ Failed to create Roomchat for user", userID, ":", err)
			continue
		}
		log.Println("✅ Created Roomchat for UserID:", userID, "RoomchatID:", roomchat.ID)

		// เพิ่มข้อความตัวอย่างในห้องแชท
		messages := []entity.Message{
			{
				Message:    "สวัสดีครับ สนใจที่ดินแปลงนี้ไหม?",
				Time:       time.Now(),
				RoomchatID: roomchat.ID,
			},
			{
				Message:    "สนใจครับ อยากทราบรายละเอียดเพิ่มเติม",
				Time:       time.Now().Add(1 * time.Minute),
				RoomchatID: roomchat.ID,
			},
			{
				Message:    "ที่ดินขนาด 5 ไร่ ราคา 2 ล้านบาทครับ",
				Time:       time.Now().Add(2 * time.Minute),
				RoomchatID: roomchat.ID,
			},
		}

		if err := db.Create(&messages).Error; err != nil {
			log.Println("❌ Failed to create messages for UserID:", userID, ":", err)
		} else {
			log.Println("✅ Created messages for UserID:", userID)
		}
	}

	log.Println("✅ Database Migrated & Seeded Successfully")

	// ✅ Seed State (แยกจาก Users)
	var stateCount int64
	db.Model(&entity.State{}).Count(&stateCount)
	if stateCount == 0 {
		db.Create(&entity.State{Name: "รอตรวจสอบ", Color: "orange"})
		db.Create(&entity.State{Name: "กำลังดำเนินการ", Color: "blue"})
		db.Create(&entity.State{Name: "เสร็จสิ้น", Color: "green"})
	}

	log.Println("✅ Database Migrated & Seeded Successfully")
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
			// เขียนแบบนี้ให้ชัดเจนและเลี่ยง race
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
