package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"backend/config"
	"backend/controller"
)

func main() {
	// โหลด .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Failed to load .env")
	}

	// เชื่อมต่อฐานข้อมูล PostgreSQL
	config.ConnectionDB()

	// AutoMigrate DB (ถ้ามี entity)
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// จุดทดสอบ API
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PostgreSQL connected ✅")
	})

	r.POST("/roles", controller.CreateRole)

	// ... ส่วนอื่น ๆ
	r.GET("/names", controller.GetAllNames)
	r.Run(":8080")


	// เริ่มรันเซิร์ฟเวอร์
	r.Run() // default :8080
}

// Middleware CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
