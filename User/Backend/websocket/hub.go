package websocket

import (
	"sync"
)

type Transaction struct {
	ID     uint
	Wallet string
	Amount float64
	Status string
}

// Hub เก็บ map ของ wallet -> clients
type Hub struct {
	mu      sync.RWMutex
	clients map[string][]*Client
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[string][]*Client),
	}
}

// เพิ่ม client เข้า hub
func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[client.Wallet] = append(h.clients[client.Wallet], client)
}

// ลบ client ออกจาก hub
func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	clients := h.clients[client.Wallet]
	for i, c := range clients {
		if c == client {
			h.clients[client.Wallet] = append(clients[:i], clients[i+1:]...)
			break
		}
	}
	if len(h.clients[client.Wallet]) == 0 {
		delete(h.clients, client.Wallet)
	}
}

// ส่ง transaction update ไปยัง wallet ที่เกี่ยวข้อง
func (h *Hub) Broadcast(tx Transaction) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, client := range h.clients[tx.Wallet] {
		select {
		case client.Send <- tx:
		default:
			// channel full, drop
		}
	}
}
