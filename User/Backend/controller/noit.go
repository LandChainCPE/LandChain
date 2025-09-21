package controller

import (
	"landchain/config"
	"landchain/entity"
	"landchain/websocket"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// NotificationWS: WebSocket endpoint สำหรับ Notification
func NotificationWS(c *gin.Context) {
	userIDParam := c.Param("userID")
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

	Hub.ServeNotificationWS(c.Writer, c.Request, uint(userID64))
}

// BroadcastNotification: ตัวอย่าง API สำหรับส่ง notification
func BroadcastNotification(c *gin.Context) {
	var payload struct {
		TargetUserID uint   `json:"targetUserID"`
		Message      string `json:"message"`
		SenderID     uint   `json:"senderID"`
		RoomID       uint   `json:"roomID"`
		Type         string `json:"type"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Println("BindJSON error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("BroadcastNotification received: %+v\n", payload)

	if Hub == nil {
		log.Println("Hub is not initialized")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hub not initialized"})
		return
	}

	log.Println("Sending notification via Hub...")
	Hub.BroadcastNotificationTarget(websocket.NotificationRequest{
		TargetUserID: payload.TargetUserID,
		Message:      payload.Message,
		SenderID:     payload.SenderID,
		RoomID:       payload.RoomID,
		Type:         payload.Type,
	})

	log.Println("Notification sent successfully")
	c.JSON(http.StatusOK, gin.H{"status": "sent"})
}


func GetUserinfoByUserID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	var user []entity.Users
	db := config.DB()

	err = db.Where("id = ? ", id).
		Find(&user).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลข้อความได้"})
		return
	}

	c.JSON(http.StatusOK, user)
}