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

	// Department Login endpoint สำหรับ Admin เท่านั้น
	r.POST("/department/login", controller.DepartmentLogin)

	// 🔒 Security API สำหรับตรวจสอบ role จาก server-side
	adminVerify := r.Group("")
	adminVerify.Use(middlewares.Authorizes())
	adminVerify.Use(middlewares.CheckAdminRole())
	{
		adminVerify.GET("/verify/admin", func(c *gin.Context) {
			// หาก middleware ผ่าน = เป็น Admin แน่นอน
			currentUser, exists := c.Get("currentUser")
			if !exists {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":    "Current user not found in context",
					"is_admin": false,
				})
				return
			}

			user := currentUser.(entity.Users)
			c.JSON(http.StatusOK, gin.H{
				"is_admin":       true,
				"role_id":        user.RoleID,
				"role_name":      user.Role.Role,
				"user_id":        user.ID,
				"wallet_address": user.Metamaskaddress,
				"verified_at":    "server-side-middleware",
				"message":        "Admin role verified by secure middleware",
			})
		})
	}

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

	// 🔐 Admin-only routes - ต้องมี admin role เท่านั้น
	admin := r.Group("")
	admin.Use(middlewares.Authorizes())
	admin.Use(middlewares.CheckAdminRole())
	{
		//----- อรรถ -------
		admin.GET("/getbookingdata", controller.GetBookingData)   //กรมที่ดินดึงข้อมูลการจอง User ทั้งหมด มาแสดง
		admin.GET("/getdatauserforverify/:bookingID", controller.GetDataUserForVerify)  //กรมที่ดิน ดึงข้อมูลการจอง มาแสดงว่าเป็น ชื่อ นามสกุล walletid อะไร
		admin.POST("/verifywalletid/:bookingID", controller.VerifyWalletID)   //กรมที่ดินกดยืนยัน ระบบ ทำการเซ็นข้อมูล เป็น Signature เก็บลง user_verification 
		admin.POST("/verifylandtitleid/:LandtitleID", controller.VerifyLandtitleID) //กรมที่ดินกดยืนยัน ระบบทำการดึงข้อมูลของที่ดิน รวมเป็น metadata ทำการเซ็นข้อมูล เก็บลง land_verification
		admin.GET("/getalllanddata", controller.GetAllLandData)   //ดึงข้อมูล โฉนดมาแสดง ทั้งหมด
		//admin.GET("getdatauserverification/:userid", controller.GetDataUserVerification)   //เป็นของ User ดึงข้อมูล ผู้ใช้ WalletID  NameHash Signature  เพื่อลงทะเบียนผู้ใช้ลงBlockchain
		//จบ----- อรรถ -------

		admin.DELETE("/bookings/delete-expired", controller.DeleteExpiredBookingsManual)
		admin.DELETE("/bookings/delete-expired-by-date", controller.DeleteExpiredBookingsByDate)
		admin.GET("/bookings/upcoming-expired", controller.GetUpcomingExpiredBookings)
	}


	// 👤 User routes with ownership validation - ต้องเป็นเจ้าของข้อมูลหรือ admin
	userOwnership := r.Group("")
	userOwnership.Use(middlewares.Authorizes())
	userOwnership.Use(middlewares.CheckOwnershipOrAdmin())
	{
		userOwnership.POST("/userbookings", controller.CreateBooking)      // สร้างการจอง
		userOwnership.PUT("/bookings/:id", controller.UpdateBooking)       // อัปเดตการจอง
		userOwnership.GET("/bookings/:userID", controller.GetUserBookings) // ดึงข้อมูลการจองตาม ID
		userOwnership.GET("/user/lands/get/transation/:id", controller.GetTransationByUserID)
		userOwnership.DELETE("/user/lands/delete/requestbuy", controller.DeleteRequestBuyByUserIDAndLandID)
		userOwnership.DELETE("/user/lands/delete/requestsell", controller.DeleteRequestSellByUserIDAndLandID)
		userOwnership.PUT("/user/lands/put/transation/buyerupdate", controller.UpdateTransactionBuyerAccept)
	}

	// 🔑 User routes with token-based access - ใช้ข้อมูลจาก JWT token
	userToken := r.Group("")
	userToken.Use(middlewares.Authorizes())
	userToken.Use(middlewares.CheckTokenOwnership())
	{
		userToken.GET("/getdatauserverification/:userid", controller.GetDataUserVerification) //ดึงข้อมูล user_verification
		//555userToken.GET("/user/info/", controller.GetInfoUserByWalletID)
		//555userToken.GET("/user/lands", controller.GetLandTitleInfoByWallet)
		//555userToken.GET("/user/info", controller.GetInfoUserByToken)
		//555userToken.GET("/user/lands/requestsell", controller.GetAllRequestSellByUserID)
		userToken.GET("/user/lands/requestsellbydelete", controller.GetAllRequestSellByUserIDAndDelete)
	}

	// 🌐 General authorized routes - ต้อง login แต่ไม่ต้องเช็ค ownership
	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{
		//J
		authorized.GET("/petition/:user_id", controller.GetAllPetition)
		authorized.GET("/petitions", controller.GetAllPetition)
		authorized.POST("/petitions", controller.CreatePetition)
		authorized.GET("/states", controller.GetAllStates)
		authorized.GET("/tags", controller.GetTags)
		authorized.POST("/landpost", controller.CreateLandPost)
		authorized.GET("/landposts", controller.GetAllPostLandData)
		authorized.GET("/province", controller.GetAllProvinces)
		authorized.GET("/district/:id", controller.GetDistrict)
		authorized.GET("/subdistrict/:id", controller.GetSubdistrict)
		authorized.GET("/landtitle/by-token/:token_id", controller.GetLandtitleIdByTokenId)
		authorized.POST("/location", controller.CreateLocation)               // สร้างโฉนดที่ดิน
		authorized.GET("/provinces", controller.GetProvince)                  // ดึงข้อมูลจังหวัด
		authorized.GET("/provinces/filter", controller.GetProvincesForFilter) // ดึงข้อมูลจังหวัดสำหรับ filter
		authorized.GET("/branches", controller.GetBranch)                     // ดึงข้อมูลสาขา
		authorized.GET("/branches/filter", controller.GetBranchesForFilter)   // ดึงข้อมูลสาขาสำหรับ filter
		authorized.GET("/time", controller.GetTime)                           // ดึงข้อมูลช่วงเวลา
		authorized.GET("/bookings", controller.GetBookingsByDateAndBranch)
		authorized.GET("/service-types", controller.GetServiceType)          // ดึงข้อมูลประเภทบริการ
		authorized.GET("/bookings/checklim", controller.CheckAvailableSlots) // ดึงข้อมูลการจองตาม ID
		authorized.GET("/bookings/status", controller.CheckBookingStatus)
		authorized.GET("/locations/:landsalepost_id", controller.GetLocationsByLandSalePostId)

		authorized.GET("/location", controller.GetLocations) // ดึงข้อมูลโฉนดที่ดิน

		// CONTROLLER Public Land Data
		authorized.GET("/user/landinfo/:id", controller.GetLandInfoByTokenID)
		authorized.GET("/user/lands", controller.GetLandTitleInfoByWallet)
		authorized.GET("/user/info", controller.GetInfoUserByToken)

		//555authorized.GET("/user/lands/requestbuy/:id", controller.GetRequestBuybyLandID)
		//555authorized.DELETE("/user/lands/delete/requestbuy", controller.DeleteRequestBuyByUserIDAndLandID)

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
		// ส่ง ContractInstance.Contract เข้าไป
		authorized.GET("/lands/check-owner", controller.CheckOwnerHandler)

		// CONTROLLER RegisterLand
		authorized.POST("/user/userregisland", controller.UserRegisLand)
		authorized.GET("/userinfo/:userId", controller.GetUserinfoByID)
		authorized.GET("/landtitles/:userid", controller.GetLandtitlesByUserID) //ดึงข้อมูล landtitles
		// authorized.GET("/land_verification/:userid", controller.GetLandVerificationByUserID) //ดึงข้อมูล land_verification
	}

	// 🌐 Public routes (outside authorized groups)
	r.GET("/user/chat/:id", controller.GetAllLandDatabyID)
	r.GET("/user/:id", controller.GetUserByID)
	r.GET("/ws/transactions", controller.TransactionWS(hub))

	// public := r.Group("")
	// {
	// 	public.GET("/uploads/*filename", animal.ServeImage)
	// 	public.GET("/genders", user.ListGenders)
	// 	public.POST("/signup", user.CreateUser)
	// }

	r.Run(":8080")
	r.Run()
}

// Middleware CORS - รองรับ Frontend หลายตัว
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// รองรับ User Frontend และ Department Frontend
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := []string{
			"http://localhost:5173", // User Frontend (Vite default)
			"http://localhost:5174", // Department Frontend (Vite port 2)
			"http://localhost:3000", // React default (ถ้ามี)
			"http://localhost:3001", // React port 2 (ถ้ามี)
		}

		// ตรวจสอบว่า origin อยู่ในรายการที่อนุญาตไหม
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}

		// ถ้าไม่พบ origin ที่อนุญาต ให้ใช้ * (สำหรับ development)
		if c.Writer.Header().Get("Access-Control-Allow-Origin") == "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}

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
