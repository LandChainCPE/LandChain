package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"landchain/entity"
	"time"
)

var DB *gorm.DB

func SetupDatabase() {
	// โหลดไฟล์ .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Failed to load .env file")
	}

	// สร้าง DSN จาก .env
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// เชื่อมต่อฐานข้อมูล
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	err = db.Migrator().DropTable(
		&entity.Booking{},
		&entity.Branch{},
		&entity.Province{},
		&entity.Time{},
		&entity.Users{},
		&entity.Role{},
		&entity.Typetransaction{},
		&entity.Landtitle{},
		&entity.Landsalepost{},
		&entity.Transaction{},
		&entity.Photoland{},
		&entity.Roomchat{},
		&entity.Message{},
		&entity.Copyrequest{},
	)

	if err != nil {
		log.Fatal("❌ Failed to drop tables:", err)
	}

	// AutoMigrate สร้างตาราง
	err = db.AutoMigrate(
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
	)

	var count int64
	db.Model(&entity.Users{}).Count(&count)
	if count == 0 {
		db.Create(&entity.Role{Role: "User"})
		db.Create(&entity.Role{Role: "Admin"})

		RefRole := uint(1)
		db.Create(&entity.Users{Name: "Jo", Password: "jo123456", Land: "12กท85", RoleID: RefRole})
		db.Create(&entity.Users{Name: "Aut", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})

		db.Create(&entity.Time{Timework: "09.00น.-10.00น."})
		db.Create(&entity.Time{Timework: "13.00น.-15.00น."})

		db.Create(&entity.Province{Province: "นครราชสีมา"})
		db.Create(&entity.Province{Province: "อุบลราชธานี"})
		db.Create(&entity.Province{Province: "มหาสารคาม"})

		RefProvince := uint(2)
		db.Create(&entity.Branch{Branch: "น้ำยืน", ProvinceID: RefProvince})

		customDate, _ := time.Parse("2006-01-02", "2025-07-20")
		db.Create(&entity.Booking{DateBooking: customDate,TimeID: uint(2), UserID: uint(2), BranchID: uint(1)})
	}

	if err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}

	DB = db
	log.Println("✅ Database connected and migrated successfully")
}
