package controller

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"landchain/config"
	"landchain/entity"
	"landchain/websocket"

	"github.com/gin-gonic/gin"
)

var Hub *websocket.Hub

// SetHub ใช้ตั้งค่า Hub จาก main.go
func SetHub(h *websocket.Hub) {
	Hub = h
}

// Websocket ใช้สำหรับเชื่อมต่อ WebSocket
func Websocket(c *gin.Context) {
	roomIDParam := c.Param("roomID")
	userIDParam := c.Param("userID")

	roomID64, err := strconv.ParseUint(roomIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid roomID"})
		return
	}

	userID64, err := strconv.ParseUint(userIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid userID"})
		return
	}

	if Hub == nil {
		log.Println("Hub is not initialized")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hub not initialized"})
		return
	}

	websocket.ServeWS(config.DB(), Hub, uint(roomID64), uint(userID64), c.Writer, c.Request)

}

// CreateNewRoom ใช้สร้างห้อง chat ใหม่
func CreateNewRoom(c *gin.Context) {
	var payload struct {
		User1ID uint `json:"user1_id"`
		User2ID uint `json:"user2_id"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	var room entity.Roomchat

	// ตรวจสอบว่ามี room ระหว่าง 2 คนนี้อยู่แล้วหรือไม่
	if err := db.Where("(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		payload.User1ID, payload.User2ID, payload.User2ID, payload.User1ID).First(&room).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"room_id": room.ID, "message": "Room already exists"})
		return
	}

	// ถ้าไม่มี ให้สร้าง room ใหม่
	room = entity.Roomchat{
		User1ID: payload.User1ID,
		User2ID: payload.User2ID,
	}
	if err := db.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create room"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"room_id": room.ID, "message": "Room created"})
}

// GetRoomMessages ดึงข้อความทั้งหมดในห้อง
func GetRoomMessages(c *gin.Context) {
	roomIDParam := c.Param("roomID")
	roomID64, err := strconv.ParseUint(roomIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid roomID"})
		return
	}

	// รับค่า limit และ offset จาก query string
	limitStr := c.DefaultQuery("limit", "20")  // ค่า default 20 ข้อความ
	offsetStr := c.DefaultQuery("offset", "0") // ค่า default เริ่มจาก 0

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	db := config.DB()
	var messages []entity.Message

	// ดึงข้อความล่าสุดก่อน (เรียงใหม่ -> เก่า) พร้อม preload sender
	if err := db.Preload("Sender").
		Where("room_id = ?", uint(roomID64)).
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch messages"})
		return
	}

	// กลับลำดับให้ client แสดงเก่า -> ใหม่
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": messages,
		"limit":    limit,
		"offset":   offset,
		"count":    len(messages),
	})
}

func GetAllRoomMessagesByUserID(c *gin.Context) {
	userIDParam := c.Param("id")
	userID64, err := strconv.ParseUint(userIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid roomID"})
		return
	}

	db := config.DB()
	var Roomchat []entity.Roomchat
	if err := db.Where("user1_id = ? OR user2_id = ?", uint(userID64), uint(userID64)).Preload("User1").Preload("User2").Order("created_at asc").Find(&Roomchat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": Roomchat})
}

func GetUserIDByWalletAddress(c *gin.Context) {
	// ดึง wallet address จาก context (สมมติ middleware ใส่ให้)
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address not found"})
		return
	}

	// สมมติ db เป็น GORM
	db := config.DB()
	var user entity.Users
	if err := db.Where("metamaskaddress = ?", walletAddr).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// ส่งกลับ UserID
	c.JSON(http.StatusOK, gin.H{
		"user_id": user.ID,
		"wallet":  walletAddr,
	})
}

func UploadImage(c *gin.Context) {
	roomID := c.Param("roomID")
	userID := c.Param("userID")

	log.Println("Upload file to room:", roomID, "by user:", userID)
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// สร้างชื่อไฟล์ไม่ซ้ำ
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	savePath := filepath.Join("uploads/chat", filename)

	// เซฟไฟล์
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// ตรวจสอบ type
	fileType := "file"
	if strings.HasPrefix(file.Header.Get("Content-Type"), "image/") {
		fileType = "image"
	}

	// ตอบกลับ URL + type
	url := fmt.Sprintf("http://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io/uploads/chat/%s", filename)
	c.JSON(http.StatusOK, gin.H{
		"url":  url,
		"type": fileType,
	})
}
