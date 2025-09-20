package main

import (
	"log"
	"net/http"

	"landchain/config"
	"landchain/controller"
	"landchain/entity"
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
	db := config.DB()
	r := gin.Default()
	hub := websocket.NewHub(db)
	go hub.Run()
	controller.SetHub(hub)
	controller.InitContract()
	r.Use(CORSMiddleware())

	// เริ่มต้น Scheduler สำหรับลบการจองที่หมดอายุ
	controller.StartBookingCleanupScheduler()

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PostgreSQL connected ✅")
	})

	r.POST("/createaccount", controller.CreateAccount)
	r.POST("/check-wallet", controller.CheckWallet)
	r.POST("/login", controller.LoginUser)
	r.POST("/register", controller.RegisterUser)

	r.GET("/nonce/:address", controller.GetNonce)
	r.POST("/nonce/validate", controller.ValidateNonce)

	// 🔧 Debug API เพื่อตรวจสอบข้อมูล user (ชั่วคราว)
	debugAuth := r.Group("")
	debugAuth.Use(middlewares.Authorizes())
	{
		debugAuth.GET("/debug/myinfo", func(c *gin.Context) {
			currentWallet, _ := c.Get("wallet")
			db := config.DB()
			var currentUser entity.Users
			if err := db.Preload("Role").Where("metamaskaddress = ?", currentWallet).First(&currentUser).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found", "wallet": currentWallet})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"user_id":   currentUser.ID,
				"wallet":    currentUser.Metamaskaddress,
				"role_id":   currentUser.RoleID,
				"role_name": currentUser.Role.Role,
				"role_obj":  currentUser.Role,
			})
		})
	}

	// 🔐 Admin-only routes
	admin := r.Group("")
	admin.Use(middlewares.Authorizes())
	admin.Use(middlewares.CheckAdminRole())
	{
		admin.GET("/getbookingdata", controller.GetBookingData)
		admin.GET("/getdatauserforverify/:bookingID", controller.GetDataUserForVerify)
		admin.POST("/verifywalletid/:bookingID", controller.VerifyWalletID)
		admin.DELETE("/bookings/delete-expired", controller.DeleteExpiredBookingsManual)
		admin.DELETE("/bookings/delete-expired-by-date", controller.DeleteExpiredBookingsByDate)
		admin.GET("/bookings/upcoming-expired", controller.GetUpcomingExpiredBookings)
		admin.POST("/location", controller.CreateLocation) // สร้างโฉนดที่ดิน
	}

	// 👤 User routes with ownership validation
	userOwnership := r.Group("")
	userOwnership.Use(middlewares.Authorizes())
	userOwnership.Use(middlewares.CheckOwnershipOrAdmin())
	{
		userOwnership.POST("/userbookings", controller.CreateBooking)
		userOwnership.PUT("/bookings/:id", controller.UpdateBooking)
		userOwnership.GET("/bookings/:userID", controller.GetUserBookings)
		userOwnership.GET("/user/lands/get/transation/:id", controller.GetTransationByUserID)
		userOwnership.DELETE("/user/lands/delete/requestbuy", controller.DeleteRequestBuyByUserIDAndLandID)
		userOwnership.DELETE("/user/lands/delete/requestsell", controller.DeleteRequestSellByUserIDAndLandID)
		userOwnership.PUT("/user/lands/put/transation/buyerupdate", controller.UpdateTransactionBuyerAccept)
	}

	// 🔑 User routes with token-based access
	userToken := r.Group("")
	userToken.Use(middlewares.Authorizes())
	userToken.Use(middlewares.CheckTokenOwnership())
	{
		userToken.GET("/getdatauserverification/:userid", controller.GetDataUserVerification)
		userToken.GET("/user/info/", controller.GetInfoUserByWalletID)
		userToken.GET("/user/lands", controller.GetLandTitleInfoByWallet)
		userToken.GET("/user/lands/requestsellbydelete", controller.GetAllRequestSellByUserIDAndDelete)
	}

	// 🌐 General authorized routes
	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{
		authorized.GET("/petitions", controller.GetAllPetition)
		authorized.POST("/petitions", controller.CreatePetition)
		authorized.GET("/states", controller.GetAllStates)
		authorized.GET("/tags", controller.GetTags)
		authorized.POST("/landpost", controller.CreateLandPost)
		authorized.GET("/landposts", controller.GetAllPostLandData)
		authorized.GET("/province", controller.GetAllProvinces)
		authorized.GET("/district/:id", controller.GetDistrict)
		authorized.GET("/subdistrict/:id", controller.GetSubdistrict)
		authorized.GET("/provinces", controller.GetProvince)
		authorized.GET("/branches", controller.GetBranch)
		authorized.GET("/time", controller.GetTime)
		authorized.GET("/bookings", controller.GetBookingsByDateAndBranch)
		authorized.GET("/service-types", controller.GetServiceType)
		authorized.GET("/bookings/checklim", controller.CheckAvailableSlots)
		authorized.GET("/bookings/status", controller.CheckBookingStatus)
		authorized.GET("/locations/:landsalepost_id", controller.GetLocationsByLandSalePostId)
		authorized.GET("/location", controller.GetLocations)

		// CONTROLLER Public Land Data
		authorized.GET("/user/landinfo/:id", controller.GetLandInfoByTokenID)
		authorized.GET("/user/info", controller.GetInfoUserByToken)
		authorized.GET("/user/lands/requestbuy/:id", controller.GetRequestBuybyLandID)
		authorized.GET("/user/lands/requestsell", controller.GetAllRequestSellByUserID)
		authorized.POST("/user/lands/requestsell/metadata", controller.GetMultipleLandMetadataHandler)
		authorized.POST("/user/lands/requestsell/sign", controller.SetSellInfoHandler)
		authorized.POST("/user/lands/transation", controller.CreateTransaction)
		authorized.POST("/user/lands/metadata", controller.GetLandMetadataByToken)
		authorized.POST("/user/lands/metadata/wallet", controller.GetLandMetadataByWallet)
		authorized.GET("/user/lands/get/history/:id", controller.GetLandHistory)
		authorized.POST("/user/lands/get/history/infousers", controller.GetInfoUsersByWallets)
		authorized.DELETE("/user/lands/delete/transaction/:id", controller.DeleteTransaction)
		authorized.GET("/user/get/saleinfo/:id", controller.GetSaleInfoHandler)
		authorized.GET("/user/get/metamaskaddress/:id", controller.GetUserAddressLand)
		authorized.POST("/user/post/tranferland", controller.BuyLandHandler)
		authorized.DELETE("/user/lands/delete/allrequset/:id", controller.DeleteAllRequestBuyByLandID)
		authorized.DELETE("/user/lands/delete/transactionallrequest/:id", controller.DeleteTransactionandAllrequest)
		authorized.GET("/lands/check-owner", controller.CheckOwnerHandler)
		authorized.POST("/user/userregisland", controller.UserRegisLand)
		authorized.GET("/chat/get/userid", controller.GetUserIDByWalletAddress)
		authorized.POST("/chat/create-room", controller.CreateNewRoom)
		authorized.GET("/chat/messages/:roomID", controller.GetRoomMessages)
		authorized.GET("/chat/allroom/:id", controller.GetAllRoomMessagesByUserID)
		authorized.POST("/upload/:roomID/:userID", controller.UploadImage)
		authorized.GET("/user/info/:id", controller.GetUserinfoByUserID)

	}


	r.GET("/ws/notification/:userID", controller.NotificationWS)
	r.POST("/notification/send", controller.BroadcastNotification)

	r.GET("/ws/chat/:roomID/:userID", controller.Websocket)
	r.Static("/uploads", "./uploads")

	r.Run(":8080")
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
