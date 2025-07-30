package controller

import (
	"encoding/json"
	"fmt"
	"landchain/config"
	"landchain/entity"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Upgrade HTTP connection to websocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // ปรับตาม policy คุณ
	},
}

// client represents a websocket client connection
type client struct {
	conn   *websocket.Conn
	roomID string
}

// Hub manages clients per room
type Hub struct {
	rooms map[string]map[*client]bool
	mu    sync.Mutex
}

var hub = Hub{
	rooms: make(map[string]map[*client]bool),
}

func (h *Hub) addClient(c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[c.roomID] == nil {
		h.rooms[c.roomID] = make(map[*client]bool)
	}
	h.rooms[c.roomID][c] = true
}

func (h *Hub) removeClient(c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if clients, ok := h.rooms[c.roomID]; ok {
		delete(clients, c)
		if len(clients) == 0 {
			delete(h.rooms, c.roomID)
		}
	}
}

func (h *Hub) broadcast(roomID string, message []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for c := range h.rooms[roomID] {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("WriteMessage error: %v", err)
			c.conn.Close()
			delete(h.rooms[roomID], c)
		}
	}
}

// บันทึกลง database
type IncomingMessage struct {
	Message    string `json:"message"`
	RoomchatID uint   `json:"roomchat_id"`
}

func SaveMessageToDB(roomID string, msg []byte) error {
	var incoming IncomingMessage
	if err := json.Unmarshal(msg, &incoming); err != nil {
		return err
	}

	var roomchatID uint
	_, err := fmt.Sscanf(roomID, "%d", &roomchatID)
	if err != nil {
		return err
	}

	message := entity.Message{
		Message:    incoming.Message,
		Time:       time.Now(),
		RoomchatID: roomchatID,
	}

	if err := config.DB().Create(&message).Error; err != nil {
		return err
	}

	return nil
}

// HandleWebSocket handles incoming websocket requests
func HandleWebSocket(c *gin.Context) {
	roomID := c.Param("roomID")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to set websocket upgrade: %v", err)
		return
	}
	client := &client{conn: conn, roomID: roomID}
	hub.addClient(client)
	defer func() {
		hub.removeClient(client)
		conn.Close()
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			break
		}

		// บันทึกข้อความลงฐานข้อมูลก่อน
		if err := SaveMessageToDB(roomID, msg); err != nil {
			log.Printf("Failed to save message to DB: %v", err)
			// อาจแจ้ง error กลับ client หรือข้ามไปก็ได้
		}

		// ส่งข้อความไปยัง client ในห้องเดียวกัน
		hub.broadcast(roomID, msg)
	}
}
