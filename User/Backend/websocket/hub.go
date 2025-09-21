package websocket

import (
	"encoding/json"
	"fmt"
	"landchain/entity"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// -------------------- Client --------------------
type Client struct {
	UserID uint
	RoomID uint
	Active bool
	Send   chan []byte
}

// -------------------- Hub --------------------
type Hub struct {
	rooms      map[uint]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan BroadcastRequest
	DB         *gorm.DB
}

type BroadcastRequest struct {
	RoomID  uint
	Message Message
}

type Message struct {
	SenderID uint        `json:"SenderID"`
	RoomID   uint        `json:"RoomID"`
	Type     string      `json:"Type"`
	Content  interface{} `json:"Content"`
}

type NotificationRequest struct {
	Message      string `json:"message"`
	TargetUserID uint   `json:"targetUserID"`
	SenderID     uint   `json:"senderID"`
	RoomID       uint   `json:"roomID"`
	Type         string `json:"type"`
}

func NewHub(db *gorm.DB) *Hub {
	return &Hub{
		rooms:      make(map[uint]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan BroadcastRequest),
		DB:         db,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if h.rooms[client.RoomID] == nil {
				h.rooms[client.RoomID] = make(map[*Client]bool)
			}
			h.rooms[client.RoomID][client] = true
			log.Printf("✅ Registered user=%d in room=%d\n", client.UserID, client.RoomID)

		case client := <-h.unregister:
			if _, ok := h.rooms[client.RoomID][client]; ok {
				delete(h.rooms[client.RoomID], client)
				close(client.Send)
				log.Printf("❌ Unregistered user=%d from room=%d\n", client.UserID, client.RoomID)
			}

		case req := <-h.broadcast:
			if clients, ok := h.rooms[req.RoomID]; ok {
				msgBytes, _ := json.Marshal(req.Message)
				for c := range clients {
					// Block until client รับ message
					c.Send <- msgBytes
				}
			}
		}
	}
}

func (h *Hub) AddClient(c *Client) {
	h.register <- c
}

func (h *Hub) RemoveClient(c *Client) {
	h.unregister <- c
}

// func (h *Hub) BroadcastToRoom(roomID uint, msg Message) {
// 	if clients, ok := h.rooms[roomID]; ok {
// 		msgBytes, _ := json.Marshal(msg)
// 		for c := range clients {
// 			if c.UserID == msg.SenderID { // ❌ อย่าส่งกลับผู้ส่ง
// 				continue
// 			}
// 			c.Send <- msgBytes
// 		}
// 	}
// }

// -------------------- Notification --------------------
func (h *Hub) BroadcastNotificationTarget(req NotificationRequest) {
	msg := Message{
		SenderID: req.SenderID,
		RoomID:   req.RoomID,
		Type:     req.Type,
		Content:  req.Message,
	}

	sentTo := 0
	for _, clients := range h.rooms {
		for c := range clients {
			if c.UserID == req.TargetUserID && c.Active {
				// ส่งแบบ block เพื่อไม่ให้หลุด
				c.Send <- encodeMessage(msg)
				sentTo++
			}
		}
	}
	log.Printf("Notification sent to user=%d from %d: %s (pushed to %d clients)\n",
		req.TargetUserID, req.SenderID, req.Message, sentTo)
}

func encodeMessage(msg Message) []byte {
	b, err := json.Marshal(msg)
	if err != nil {
		log.Println("encodeMessage error:", err)
		return []byte("{}")
	}
	return b
}

// -------------------- WebSocket --------------------
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (h *Hub) ServeNotificationWS(w http.ResponseWriter, r *http.Request, userID uint) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Notification WS upgrade error:", err)
		return
	}

	client := &Client{
		UserID: userID,
		RoomID: 0,
		Active: true,
		Send:   make(chan []byte, 1024), // เพิ่ม buffer
	}

	h.AddClient(client)

	// Writer goroutine
	go func() {
		defer func() {
			conn.Close()
			h.RemoveClient(client)
		}()

		// Ping-Pong heartbeat every 30s
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case msg, ok := <-client.Send:
				if !ok {
					return
				}
				if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					log.Println("Notification write error:", err)
					return
				}
			case <-ticker.C:
				if err := conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
					log.Println("Ping error:", err)
					return
				}
			}
		}
	}()

	// Reader goroutine
	go func() {
		defer h.RemoveClient(client)
		conn.SetReadLimit(512)
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		conn.SetPongHandler(func(string) error {
			conn.SetReadDeadline(time.Now().Add(60 * time.Second))
			return nil
		})

		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				log.Println("Notification WS disconnected:", err)
				break
			}
		}
	}()
}

// -------------------- Chat WS --------------------
func ServeWS(db *gorm.DB, hub *Hub, roomID, userID uint, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		UserID: userID,
		RoomID: roomID,
		Active: true,
		Send:   make(chan []byte, 1024),
	}

	hub.AddClient(client)

	// Writer goroutine
	go func() {
		defer conn.Close()
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case msg, ok := <-client.Send:
				if !ok {
					return
				}
				if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					log.Println("Write error:", err)
					return
				}
			case <-ticker.C:
				if err := conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
					log.Println("Ping error:", err)
					return
				}
			}
		}
	}()

	// Reader goroutine
	conn.SetReadLimit(512)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			hub.RemoveClient(client)
			break
		}

		var incoming Message
		if err := json.Unmarshal(msgBytes, &incoming); err != nil {
			log.Println("Invalid message:", err)
			continue
		}

		// บันทึกลง DB
		if hub.DB != nil && incoming.Type != "notification" {
			dbMsg := entity.Message{
				RoomID:   incoming.RoomID,
				SenderID: incoming.SenderID,
				Content:  fmt.Sprintf("%v", incoming.Content),
				Type:     incoming.Type,
				IsRead:   false,
			}
			if err := hub.DB.Create(&dbMsg).Error; err != nil {
				log.Println("Failed to save message:", err)
			}
		}

		// hub.BroadcastToRoom(roomID, Message{
		// 	SenderID: incoming.SenderID,
		// 	RoomID:   incoming.RoomID,
		// 	Type:     incoming.Type,
		// 	Content:  incoming.Content,
		// })
	}
}
