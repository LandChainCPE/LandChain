package config

import (
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "landchain/entity"
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
        db.Create(&entity.Role{Role: "User",})
        db.Create(&entity.Role{Role: "Admin",})
        RefRole := uint(1)
        db.Create(&entity.Users{Name: "Jo", Password: "jo123456", Land: "15+4d54df", RoleID: RefRole})
    }

    if err != nil {
        log.Fatal("❌ AutoMigrate failed:", err)
    }

    DB = db
    log.Println("✅ Database connected and migrated successfully")
}
