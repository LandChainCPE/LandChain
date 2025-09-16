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

	//อ่านค่าการตอบกลับจาก Smartcontract (ควรใช้ go routine)
	go controller.ListenSmartContractEvents()

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PostgreSQL connected ✅")
	})

	r.POST("/createaccount", controller.CreateAccount) ///???
	r.POST("/check-wallet", controller.CheckWallet)
	r.POST("/login", controller.LoginUser)
	r.POST("/register", controller.RegisterUser)

	r.GET("/nonce/:address", controller.GetNonce)
	r.POST("/nonce/validate", controller.ValidateNonce)
	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{
		authorized.GET("/getbookingdata", controller.GetBookingData)
		authorized.GET("/getdatauserforverify/:bookingID", controller.GetDataUserForVerify)
		authorized.POST("/verifywalletid/:bookingID", controller.VerifyWalletID)
		authorized.POST("/verifylandtitleid/:LandtitleID", controller.VerifyLandtitleID)
		authorized.GET("/getalllanddata", controller.GetAllLandData)
		authorized.GET("/getdatauserverification/:userid", controller.GetDataUserVerification)

		authorized.POST("/userbookings", controller.CreateBooking) // สร้างการจอง
		authorized.PUT("/bookings/:id", controller.UpdateBooking)  // อัปเดตการจอง
		//r.PUT("/bookings/:id", controller.UpdateBooking) // อัปเดตการจอง

		//J
		authorized.GET("/petitions", controller.GetAllPetition)
		authorized.POST("/petitions", controller.CreatePetition)
		authorized.GET("/states", controller.GetAllStates)
		authorized.GET("/tags", controller.GetTags)
		authorized.POST("/landpost", controller.CreateLandPost)
		authorized.GET("/landposts", controller.GetAllPostLandData)
		authorized.GET("/province", controller.GetAllProvinces)
		authorized.GET("/district/:id", controller.GetDistrict)
		authorized.GET("/subdistrict/:id", controller.GetSubdistrict)

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
		//r.GET("/user/sellpost", controller.GetAllPostLandData)

		// CONTROLLER Chat
		// r.GET("/ws/roomchat/:roomID", controller.HandleWebSocket)
		r.GET("/user/chat/:id", controller.GetAllLandDatabyID)
		// r.GET("/user/chat/roomchat/:id", controller.GetMessagesByLandPostID)
		r.GET("/user/:id", controller.GetUserByID)

		authorized.GET("/user/info/", controller.GetInfoUserByWalletID)
		authorized.GET("/user/landinfo/:id", controller.GetLandInfoByTokenID)
		authorized.GET("/user/lands", controller.GetLandTitleInfoByWallet)
		authorized.GET("/user/info", controller.GetInfoUserByToken)

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

		authorized.POST("/user/lands/metadata", controller.GetLandMetadataByToken)
		authorized.POST("/user/lands/metadata/wallet", controller.GetLandMetadataByWallet)

		// CONTROLLER RegisterLand
		authorized.POST("/user/userregisland", controller.UserRegisLand)
		//authorized.GET("/province", controller.GetAllProvinces)
		//authorized.GET("/district/:id", controller.GetDistrict)
		//authorized.GET("/subdistrict/:id", controller.GetSubdistrict)
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
