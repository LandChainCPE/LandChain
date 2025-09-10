package main

import (
	"log"
	"net/http"

	"landchain/config"
	"landchain/controller"
	"landchain/websocket"

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
	hub := websocket.NewHub()
	controller.InitContract()
	r.Use(CORSMiddleware())

	// เริ่มต้น Scheduler สำหรับลบการจองที่หมดอายุ
	controller.StartBookingCleanupScheduler()

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PostgreSQL connected ✅")
	})

	r.POST("/login", controller.LoginUser)

	r.POST("/createaccount", controller.CreateAccount)

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
		authorized.GET("/bookings/checklim", controller.CheckAvailableSlots) // ดึงข้อมูลการจองตาม ID
		authorized.GET("/bookings/status", controller.CheckBookingStatus)
		// 🎯 Routes สำหรับลบการจองที่หมดอายุ
		authorized.DELETE("/bookings/delete-expired", controller.DeleteExpiredBookingsManual)
		authorized.DELETE("/bookings/delete-expired-by-date", controller.DeleteExpiredBookingsByDate)
		authorized.GET("/bookings/upcoming-expired", controller.GetUpcomingExpiredBookings)
		authorized.GET("/bookings/:userID", controller.GetUserBookings) // ดึงข้อมูลการจองตาม ID
		authorized.GET("/locations/:landsalepost_id", controller.GetLocationsByLandSalePostId)

		//location
		authorized.GET("/location", controller.GetLocations)    // ดึงข้อมูลโฉนดที่ดิน
		authorized.POST("/location", controller.CreateLocation) // สร้างโฉนดที่ดิน
		// CONTROLLER lANDSELLPOST
		r.GET("/user/sellpost", controller.GetAllPostLandData)

		// CONTROLLER Chat
		r.GET("/ws/roomchat/:roomID", controller.HandleWebSocket)
		r.GET("/user/chat/:id", controller.GetAllLandDatabyID)
		// r.GET("/user/chat/roomchat/:id", controller.GetMessagesByLandPostID)
		r.GET("/user/:id", controller.GetUserByID)

		authorized.GET("/user/info/", controller.GetInfoUserByWalletID)
		authorized.GET("/user/landinfo/:id", controller.GetLandInfoByTokenID)
		authorized.GET("/user/lands", controller.GetLandTitleInfoByWallet)
		authorized.GET("/user/info", controller.GetInfoUserByToken)
		authorized.GET("/user/lands/metadata", controller.GetLandMetadataByWallet)
		authorized.GET("/user/lands/requestbuy/:id", controller.GetRequestBuybyLandID)
		authorized.DELETE("/user/lands/delete/requestbuy", controller.DeleteRequestBuyByUserIDAndLandID)

		authorized.GET("/user/lands/requestsell", controller.GetAllRequestSellByUserID)
		authorized.POST("/user/lands/requestsell/metadata", controller.GetMultipleLandMetadataHandler)
		authorized.DELETE("/user/lands/delete/requestsell", controller.DeleteRequestSellByUserIDAndLandID)
		authorized.GET("/user/lands/requestsellbydelete", controller.GetAllRequestSellByUserIDAndDelete)
		authorized.POST("/user/lands/requestsell/sign", controller.SetSellInfoHandler)

		r.GET("/ws/transactions", controller.TransactionWS(hub))
		authorized.POST("/user/lands/transation", controller.CreateTransaction)
		authorized.GET("/user/lands/get/transation/:id", controller.GetTransationByUserID)
		authorized.PUT("/user/lands/put/transation/buyerupdate", controller.UpdateTransactionBuyerAccept)

		// CONTROLLER RegisterLand
		//r.POST("/user/regisland", controller.RegisterLand)
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
