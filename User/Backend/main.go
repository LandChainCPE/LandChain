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
	// config.SetupDatabase()
	db := config.DB()
	r := gin.Default()
	hub := websocket.NewHub(db)
	go hub.Run()
	controller.SetHub(hub)
	controller.InitContract()
	r.Use(CORSMiddleware())
	controller.StartCron()

	// เริ่มต้น Scheduler สำหรับลบการจองที่หมดอายุ
	controller.StartBookingCleanupScheduler()

	//อ่านค่าการตอบกลับจาก Smartcontract (ควรใช้ go routine)
	go controller.ListenSmartContractEvents()    //ทั้ง Auto ทั้งมือ 

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PostgreSQL connected ✅")
	})

	// เพิ่ม/ปรับปรุง API จาก managepost.go
	r.PUT("/managepost/update/:post_id", controller.UpdatePost)
	r.DELETE("/bookings/delete-expired", controller.DeleteExpiredBookingsManual)
	r.DELETE("/bookings/delete-expired-by-date", controller.DeleteExpiredBookingsByDate)
	r.POST("/createaccount", controller.CreateAccount)
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
	r.POST("/checkverifywallet", controller.CheckVerifyWallet)

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
		//----- อรรถ -------
		admin.GET("/getbookingdata", controller.GetBookingData)                        //กรมที่ดินดึงข้อมูลการจอง User ทั้งหมด มาแสดง
		admin.GET("/getdatauserforverify/:bookingID", controller.GetDataUserForVerify) //กรมที่ดิน ดึงข้อมูลการจอง มาแสดงว่าเป็น ชื่อ นามสกุล walletid อะไร
		admin.POST("/verifywalletid/:bookingID", controller.VerifyWalletID)            //กรมที่ดินกดยืนยัน ระบบ ทำการเซ็นข้อมูล เป็น Signature เก็บลง user_verification
		admin.POST("/verifylandtitleid/:LandtitleID", controller.VerifyLandtitleID)    //กรมที่ดินกดยืนยัน ระบบทำการดึงข้อมูลของที่ดิน รวมเป็น metadata ทำการเซ็นข้อมูล เก็บลง land_verification
		admin.GET("/getalllanddata", controller.GetAllLandData)                        //ดึงข้อมูล โฉนดมาแสดง ทั้งหมด
		//admin.GET("getdatauserverification/:userid", controller.GetDataUserVerification)   //เป็นของ User ดึงข้อมูล ผู้ใช้ WalletID  NameHash Signature  เพื่อลงทะเบียนผู้ใช้ลงBlockchain
		admin.GET("/gettransactionland", controller.GetTransactionLand)
		admin.POST("/departmentoflandverifytransaction", controller.DepartmentOfLandVerifyTransaction)
		//จบ----- อรรถ -------

		admin.GET("/bookings/upcoming-expired", controller.GetUpcomingExpiredBookings)
		admin.POST("/updatepetitions", controller.UpdatePetitionStatus)

	}

	userOwnership := r.Group("")
	userOwnership.Use(middlewares.Authorizes())
	userOwnership.Use(middlewares.CheckOwnershipOrAdmin())
	{
		userOwnership.GET("/user/GetUserID/:wallet", controller.GetUserIDByWallet)
		//////////////////////////////////////////////////////////////////////////////////
		userOwnership.GET("/user/lands/:user_id", controller.GetUserPostLandData) // มีแล้ว ✅
		userOwnership.PUT("/user/posts/:post_id", controller.UpdatePost)          //ส่วนแก้ไขโพสต์
		userOwnership.GET("/user/posts/:post_id", controller.GetPostDetail)
		userOwnership.DELETE("/user/posts/:post_id", controller.DeletePost)
		//////////////////////////////////////////////////////////////////////////////////
		userOwnership.POST("/userbookings", controller.CreateBooking)
		userOwnership.PUT("/bookings/:id", controller.UpdateBooking)
		userOwnership.GET("/bookings/:userID", controller.GetUserBookings)
		userOwnership.GET("/user/lands/get/transation/:id", controller.GetTransationByUserID)
		userOwnership.DELETE("/user/lands/delete/requestbuy", controller.DeleteRequestBuyByUserIDAndLandID)
		userOwnership.DELETE("/user/lands/delete/requestsell", controller.DeleteRequestSellByUserIDAndLandID)

	}

	// 🔑 User routes with token-based access
	userToken := r.Group("")
	userToken.Use(middlewares.Authorizes())
	userToken.Use(middlewares.CheckTokenOwnership())
	{
		userToken.GET("/getdatauserverification/:userid", controller.GetDataUserVerification) //ดึงข้อมูล user_verification
		//555userToken.GET("/user/info/", controller.GetInfoUserByWalletID)
		//555userToken.GET("/user/lands", controller.GetLandTitleInfoByWallet)
		//555userToken.GET("/user/info", controller.GetInfoUserByToken)
		//555userToken.GET("/user/lands/requestsell", controller.GetAllRequestSellByUserID)

		userToken.GET("/user/info/", controller.GetInfoUserByWalletID)
		userToken.GET("/user/lands", controller.GetLandTitleInfoByWallet)

	}

	// 🌐 General authorized routes
	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{
		authorized.POST("/requestbuysell", controller.CreateRequestBuySellHandler)
		authorized.GET("/petitions/user/:user_id", controller.GetPetitionByUserId)
		//authorized.GET("/petition/:user_id", controller.GetAllPetition)
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
		authorized.GET("/service-types", controller.GetServiceType)
		authorized.GET("/bookings/checklim", controller.CheckAvailableSlots)
		authorized.GET("/bookings/status", controller.CheckBookingStatus)
		authorized.GET("/locations/:landsalepost_id", controller.GetLocationsByLandSalePostId)
		authorized.GET("/location", controller.GetLocations)

		// CONTROLLER Public Land Data
		authorized.GET("/user/landinfo/:id", controller.GetLandInfoByTokenID)
		authorized.GET("/landsalepost/check", controller.CheckLandsalepostByLandID)
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
		authorized.DELETE("/user/lands/delete/transaction/:id", controller.DeleteTransactionTodelete)
		authorized.DELETE("/user/lands/delete/transaction/success/:id", controller.DeleteTransactionToscucess)
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
		authorized.GET("/user/lands/requestsellbydelete", controller.GetAllRequestSellByUserIDAndDelete)
		authorized.PUT("/user/lands/put/transation/buyerupdate", controller.UpdateTransactionBuyerAccept)
		authorized.DELETE("/user/lands/post/:id", controller.DeleteLandsalepostByLandIDandUserID)
		authorized.PUT("/user/sale/put/updatesetsale/:id", controller.LoadUpdateSetsale)
		authorized.PUT("/user/sale/put/updatebuy/:id", controller.LoadTransactionAfterBuy)

		authorized.GET("/userinfo/:userId", controller.GetUserinfoByID)
		authorized.GET("/landtitles/:userId", controller.GetLandtitlesByUser) //ดึงข้อมูล landtitles
		// authorized.GET("/land_verification/:userid", controller.GetLandVerificationByUserID) //ดึงข้อมูล land_verification
		authorized.GET("/user/verify", controller.CheckVerify)
	}

	r.GET("/ws/notification/:userID", controller.NotificationWS)
	r.POST("/notification/send", controller.BroadcastNotification)

	r.GET("/ws/chat/:roomID/:userID", controller.Websocket)
	r.Static("/uploads", "./uploads")

	r.Run("0.0.0.0:8080")
}

// เพราะผู้ใช้ นั้นรัน Frontend ที่เครื่องตัวเอง ผู้ใช้อยู่คนละวงแลน  บอกไม่ได้ว่าผู้ใช้  ใช้เน็ต IP ไหนบ้าง  จึงเปิดรับทั้งหมด
// เพราะผู้ใช้รัน Frontend ที่เครื่องตัวเอง (IP ไม่แน่นอน, อยู่คนละวงแลน, อาจเปลี่ยนเน็ตตลอดเวลา)
// ถ้าระบุ Origin เฉพาะเจาะจงจะทำให้ผู้ใช้บางคนเข้าไม่ได้
// Middleware CORS - รองรับ Frontend หลายตัว
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ให้ทุก Origin เข้าถึง (Production)
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
