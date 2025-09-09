package controller

import (
	"landchain/config"
	"landchain/entity" // แก้ชื่อ module ให้ตรงกับโปรเจกต์คุณ
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetBookings ดึงข้อมูลการจองทั้งหมดพร้อมชื่อผู้ใช้และเวลา
// GetAllPostLandData ดึงข้อมูลการขายที่ดินทั้งหมด พร้อมข้อมูลโฉนดที่ดิน (Landtitle)
func GetAllLandDatabyID(c *gin.Context) {
	userid := c.Param("id")
	if userid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ id"})
		return
	}

	db := config.DB()

	var landtitles []entity.Landtitle
	var landposts []entity.Landsalepost

	// 1. หาข้อมูล landtitle ทั้งหมดของ user นี้
	if err := db.Where("user_id = ?", userid).Find(&landtitles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล landtitle ได้"})
		return
	}

	// 2. ดึง id ของ landtitle ออกมา
	var landtitleIDs []uint
	for _, lt := range landtitles {
		landtitleIDs = append(landtitleIDs, lt.ID)
	}

	// ถ้าไม่มี landtitle เลย
	if len(landtitleIDs) == 0 {
		c.JSON(http.StatusOK, []entity.Landsalepost{}) // ส่งกลับ array ว่าง
		return
	}

	// 3. หา post ที่ landtitle_id อยู่ในกลุ่มนี้
	if err := db.Where("landtitle_id IN ?", landtitleIDs).Find(&landposts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล post ได้"})
		return
	}

	c.JSON(http.StatusOK, landposts)
}

func GetMessagesByRoomID(c *gin.Context) {
	roomID := c.Param("roomID")

	var messages []entity.Message
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.Where("roomchat_id = ?", roomID).Order("time asc").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, messages)
}


type MessageWithUser struct {
	MessageID    uint      `json:"message_id"`
	Message      string    `json:"message"`
	RoomchatID   uint      `json:"roomchat_id"`
	UserID       uint      `json:id"`
	UserName     string    `json:"name"`  // สมมติ Users มีชื่อฟิลด์ Name
}

// func GetMessagesByLandPostID(c *gin.Context) {
// 	landPostID := c.Param("id") // <- ใช้ชื่อ param ให้สื่อความหมาย

// 	db := config.DB()

// 	// ดึง Roomchat ทั้งหมดที่อ้างถึง LandsalepostID นี้
// 	var roomchats []entity.Roomchat
// 	if err := db.Preload("Users").Where("landsalepost_id = ?", landPostID).Find(&roomchats).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึง Roomchat ได้"})
// 		return
// 	}

// 	if len(roomchats) == 0 {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบห้องแชท"})
// 		return
// 	}

// 	// รวบรวม RoomchatID ทั้งหมด
// 	var roomchatIDs []uint
// 	for _, rc := range roomchats {
// 		roomchatIDs = append(roomchatIDs, rc.ID)
// 	}

// 	// ดึงข้อความทั้งหมดในห้องเหล่านั้น
// 	var messages []entity.Message
// 	if err := db.Where("roomchat_id IN ?", roomchatIDs).Order("time asc").Find(&messages).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อความได้"})
// 		return
// 	}

// 	// สร้าง map จาก RoomchatID => User info
// 	userMap := make(map[uint]entity.Users)
// 	for _, rc := range roomchats {
// 		userMap[rc.ID] = rc.Users
// 	}

// 	// รวมข้อมูล Message + User ลง struct ใหม่
// 	var result []MessageWithUser
// 	for _, msg := range messages {
// 		user := userMap[msg.RoomchatID]
// 		result = append(result, MessageWithUser{
// 			MessageID:  msg.ID,
// 			Message:    msg.Message,
// 			RoomchatID: msg.RoomchatID,
// 			UserID:     user.ID,
// 			UserName:   user.Firstname,  // สมมติฟิลด์ชื่อว่า Name
// 		})
// 	}

// 	c.JSON(http.StatusOK, result)
// }

func GetUserByID(c *gin.Context) {
	UserID := c.Param("id")

	var User []entity.Users
	db := config.DB()

	// ดึงข้อความห้องแชทพร้อมเรียงเวลาข้อความ
	if err := db.Where("id = ?", UserID).Order("time asc").Find(&User).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, User)
}
