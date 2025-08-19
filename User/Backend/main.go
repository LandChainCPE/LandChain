package main

import (
	"log"
	"net/http"

	"landchain/config"
	"landchain/controller"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"landchain/middlewares"
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

	r.POST("/createaccount", controller.CreateAccount)
	r.POST("/check-wallet", controller.CheckWallet)
	r.POST("/login", controller.LogiำnUser)

	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{
		authorized.GET("/getbookingdata", controller.GetBookingData)
		authorized.POST("/userbookings", controller.CreateBooking) // สร้างการจอง
		authorized.PUT("/bookings/:id", controller.UpdateBooking)  // อัปเดตการจอง
		//r.PUT("/bookings/:id", controller.UpdateBooking) // อัปเดตการจอง

		//J
		authorized.GET("/petitions", controller.GetAllPetition)
		authorized.POST("/petitions", controller.CreatePetition)
		authorized.GET("/states", controller.GetAllStates)

		authorized.GET("/provinces", controller.GetProvince) // ดึงข้อมูลจังหวัด
		authorized.GET("/branches", controller.GetBranch)    // ดึงข้อมูลสาขา
		authorized.GET("/time", controller.GetTime)          // ดึงข้อมูลช่วงเวลา
		authorized.GET("/bookings", controller.GetBookingsByDateAndBranch)
		authorized.GET("/service-types", controller.GetServiceType)          // ดึงข้อมูลประเภทบริการ
		authorized.GET("/bookings/status/:id", controller.GetBookingStatus)  // ดึงข้อมูลการจองตาม ID
		authorized.GET("/bookings/checklim", controller.CheckAvailableSlots) // ดึงข้อมูลการจองตาม ID

		// CONTROLLER lANDSELLPOST
		r.GET("/user/sellpost", controller.GetAllPostLandData)

		// CONTROLLER Chat
		r.GET("/ws/roomchat/:roomID", controller.HandleWebSocket)
		r.GET("/user/chat/:id", controller.GetAllLandDatabyID)
		r.GET("/user/chat/roomchat/:id", controller.GetMessagesByLandPostID)
		r.GET("/user/:id", controller.GetUserByID)
	}

	// public := r.Group("")
	// {
	// 	public.GET("/uploads/*filename", animal.ServeImage)
	// 	public.GET("/genders", user.ListGenders)
	// 	public.POST("/signup", user.CreateUser)

	// }

	r.Run(":8080")
	r.Run()
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
