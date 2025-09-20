import React, { useEffect, useState, useRef } from "react";

interface Message {
  id?: number;
  sender_id: number;
  content: string;
  created_at?: string;
}

interface ChatRoomProps {
  roomID: number;
  userID: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomID, userID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  function connectWebSocket(userID: number, roomID: number) {
    const ws = new WebSocket(`ws://172.20.10.2:8080/ws/chat/${roomID}/${userID}`);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const newMsg: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, newMsg]);
      } catch (err) {
        console.error("Invalid message format:", event.data);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return ws;
  }

  useEffect(() => {
    const ws = connectWebSocket(userID, roomID);
    wsRef.current = ws;

    return () => {
      wsRef.current?.close();
    };
  }, [roomID, userID]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg: Message = {
      sender_id: userID,
      content: input,
    };

    wsRef.current?.send(JSON.stringify(msg));
    setInput("");
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <div style={{ border: "1px solid #ccc", padding: 10, height: 400, overflowY: "scroll" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <strong>{msg.sender_id === userID ? "You" : `User ${msg.sender_id}`}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          style={{ flex: 1, padding: 5 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button style={{ marginLeft: 5 }} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
