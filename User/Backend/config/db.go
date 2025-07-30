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
	//"time"
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
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
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

// ✅ SetupDatabase: ทำ Drop Table, AutoMigrate, และ Seed ข้อมูล
func SetupDatabase() {
	if DB == nil {
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
	); err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}

	// Seed Data
	var count int64
	db.Model(&entity.Users{}).Count(&count)
	if count == 0 {
		db.Create(&entity.Role{Role: "User"})
		db.Create(&entity.Role{Role: "Admin"})

		RefRole := uint(1)
		db.Create(&entity.Users{Name: "Jo", Email: "@good", Phonenumber: "0912345678", Password: "jo123456", Land: "12กท85", RoleID: RefRole})
		db.Create(&entity.Users{Name: "Aut", Email: "@goods", Phonenumber: "0912345679", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})
		db.Create(&entity.Users{Name: "Bam", Email: "@goods1", Phonenumber: "0912345677", Password: "1234564", Land: "ผหก5ป58ก", RoleID: RefRole})

		db.Create(&entity.Time{Timework: "09:00 - 10:00"})
		db.Create(&entity.Time{Timework: "10:00 - 11:00"})
		db.Create(&entity.Time{Timework: "11:00 - 12:00"})
		db.Create(&entity.Time{Timework: "13:00 - 14:00"})
		db.Create(&entity.Time{Timework: "14:00 - 15:00"})
		db.Create(&entity.Time{Timework: "15:00 - 16:00"})

		db.Create(&entity.Province{Province: "นครราชสีมา"})
		db.Create(&entity.Province{Province: "อุบลราชธานี"})
		db.Create(&entity.Province{Province: "มหาสารคาม"})

		RefProvince := uint(2)
		db.Create(&entity.Branch{Branch: "น้ำยืน", ProvinceID: RefProvince})

		//customDate, _ := time.Parse("2006-01-02", "2025-07-20")
		//db.Create(&entity.Booking{DateBooking: customDate, TimeID: uint(2), UserID: uint(2), BranchID: uint(1)})

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

		for _, name := range provinces {
			db.Create(&entity.LandProvinces{Name: name})
		}

		var count int64
		db.Model(&entity.LandProvinces{}).Count(&count)

		if count == 0 {
			for _, name := range provinces {
				db.Create(&entity.LandProvinces{Name: name})
			}
		}

	}

	// 🔸 ตรวจสอบและสร้าง Landtitle ถ้ายังไม่มี
	var landtitle1, landtitle2 entity.Landtitle

	if err := db.Where("field = ?", "โฉนดเลขที่ 000008 แปลง 180").First(&landtitle1).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			landtitle1 = entity.Landtitle{
				Field:           "โฉนดเลขที่ 000008 แปลง 180",
				UserID:          1,
				LandProvincesID: 1,
			}
			db.Create(&landtitle1)
		}
	}

	if err := db.Where("field = ?", "โฉนดเลขที่ 000009 แปลง 264").First(&landtitle2).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			landtitle2 = entity.Landtitle{
				Field:           "โฉนดเลขที่ 000009 แปลง 264",
				UserID:          1,
				LandProvincesID: 1,
			}
			db.Create(&landtitle2)
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

}
