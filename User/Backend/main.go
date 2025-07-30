package main

import (
	"log"
	"net/http"

	"landchain/config"
	"landchain/controller"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// โหลด .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Failed to load .env")
	}

	config.ConnectDatabase()

	config.SetupDatabase()
	r := gin.Default()
	r.Use(CORSMiddleware())

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PostgreSQL connected ✅")
	})

	r.GET("/getbookingdata", controller.GetBookingData)
	r.POST("/userbookings", controller.CreateBooking) // สร้างการจอง
<<<<<<< HEAD
	r.PUT("/bookings/:id", controller.UpdateBooking)  // อัปเดตการจอง
=======
	r.PUT("/bookings/:id", controller.UpdateBooking) // อัปเดตการจอง
	r.GET("/provinces", controller.GetProvince) // ดึงข้อมูลจังหวัด
	r.GET("/branches", controller.GetBranch) // ดึงข้อมูลสาขา
	r.GET("/time", controller.GetTime) // ดึงข้อมูลช่วงเวลา
	r.GET("/bookings", controller.GetBookingsByDateAndBranch)
	r.GET("/service-types", controller.GetServiceType) // ดึงข้อมูลประเภทบริการ
	r.GET("/bookings/status/:id", controller.GetBookingStatus) // ดึงข้อมูลการจองตาม ID
	r.GET("/bookings/checklim", controller.CheckAvailableSlots) // ดึงข้อมูลการจองตาม ID
	r.Run(":8080")
>>>>>>> origin

	// CONTROLLER lANDSELLPOST
	r.GET("/user/sellpost", controller.GetAllPostLandData)

	// CONTROLLER Chat
	r.GET("/ws/roomchat/:roomID", controller.HandleWebSocket)
	r.GET("/user/chat/:id", controller.GetAllLandDatabyID)
	r.GET("/user/chat/roomchat/:id", controller.GetMessagesByLandPostID)
	r.GET("/user/:id", controller.GetUserByID)

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
