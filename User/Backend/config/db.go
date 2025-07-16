package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"landchain/entity"
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
		db.Create(&entity.Users{Name: "Jo", Password: "jo123456", Land: "12กท85", RoleID: RefRole})
		db.Create(&entity.Users{Name: "Aut", Password: "Aut123456", Land: "ผหก5ป58ก", RoleID: RefRole})

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
	}

	log.Println("✅ Database Migrated & Seeded Successfully")
}