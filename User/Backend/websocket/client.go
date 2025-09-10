package websocket

import (
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	Wallet string
	Conn   *websocket.Conn
	Send   chan Transaction
}

func (c *Client) ReadPump(hub *Hub) {
	defer func() {
		hub.Unregister(c)
		c.Conn.Close()
	}()

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			break
		}
		// ถ้าต้องการ handle ข้อมูลจาก client สามารถเพิ่ม logic ตรงนี้
	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()
	for tx := range c.Send {
		if err := c.Conn.WriteJSON(tx); err != nil {
			log.Println("write error:", err)
			break
		}
	}
}
