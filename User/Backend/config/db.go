package config

import (
	"fmt"
	"log"
	"os"

	"backend/entity"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/joho/godotenv"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Error loading .env file")
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect database:", err)
	}

	fmt.Println("✅ Connected to PostgreSQL")
	db = database
}

func SetupDatabase() {
	err := db.AutoMigrate(
		&entity.Users{},
		&entity.Role{},
		&entity.Name{},
	)
	if err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}
	fmt.Println("✅ AutoMigrate complete")
}
