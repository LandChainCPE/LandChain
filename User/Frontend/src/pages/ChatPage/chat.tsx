import { useEffect, useRef, useState } from "react";
import Navbar from "../../component/user/Navbar";
import "./chat.css";
import "./picture.css";
import axios from "axios";
import Picture from "../../assets/Land-shape-for-buy.jpg";
import { GetMessagesByLandPostID } from "../../service/https/index";

type MessageWithUser = {
  message_id: number;
  message: string;
  roomchat_id: number;
  user_id: number;
  user_name: string;
};

type Land = {
  ID: number;
  Name: string;
  AdressLandplot: string;
  PhoneNumber: string;
  Price: number;
  NumOfLandTitle: number;
};

function Chat({ roomId, onNewMessage }) {
  const [landPosts, setLandPosts] = useState<Land[]>([]);
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const userId = 1;

  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uniqueUsers = Array.from(
  new Set(messages.map((msg) => msg.user_name))
).filter(name => name !== "คุณ");

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await axios.get<Land[]>(
          `http://localhost:8080/user/chat/${userId}`
        );
        setLandPosts(res.data);
      } catch (error) {
        console.error("Error loading lands", error);
      }
    };

    fetchLands();
  }, []);

  useEffect(() => {
  async function fetchMessages() {
    if (!selectedLandId) return;

    setLoading(true);
    setError(null);
    try {
      const rawData = await GetMessagesByLandPostID(
        selectedLandId.toString()
      );

      if (rawData.length === 0) {
        // ไม่มีคนแชทเลย รีเซ็ตข้อความและ user ที่เลือก
        setMessages([]);
        setSelectedUser(null);
      } else {
        const formatted = rawData.map((msg: any) => ({
          message_id: msg.message_id,
          message: msg.message,
          roomchat_id: msg.roomchat_id,
          user_id: msg.UserID,
          user_name: msg.name,
        }));
        setMessages(formatted);

        // ถ้า user ที่เลือกปัจจุบัน ไม่มีในรายชื่อใหม่ รีเซ็ต selectedUser
        const userNames: string[] = Array.from(new Set(formatted.map((m: MessageWithUser) => m.user_name)));
        if (!userNames.includes(selectedUser ?? "")) {
          setSelectedUser(null);
        }
      }
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลได้");
      setMessages([]);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  }

  fetchMessages();
}, [selectedLandId]);


// Websocket
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
    if (!selectedLandId) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const socket = new WebSocket(
      `ws://localhost:8080/ws/roomchat/${selectedLandId}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      // สมมุติข้อมูลที่รับมาเป็น JSON ของ message
      const data = JSON.parse(event.data) as MessageWithUser;

      // เพิ่มข้อความใหม่เข้า messages
      setMessages((prev) => [...prev, data]);

      // ถ้า user ใหม่ ให้เพิ่ม user list และเลือก user อัตโนมัติ (optional)
      if (!uniqueUsers.includes(data.user_name)) {
        setSelectedUser(data.user_name);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    wsRef.current = socket;

    return () => {
      socket.close();
      wsRef.current = null;
    };
  }, [selectedLandId]); // เมื่อเปลี่ยน LandId ให้รีเซ็ต WS

  // ฟังก์ชันส่งข้อความผ่าน WebSocket
  const sendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket ยังไม่เชื่อมต่อ");
      return;
    }
    if (message.trim() === "") return;

    // สร้าง object ข้อความที่ต้องการส่ง (คุณอาจต้องปรับให้ตรงกับ backend)
    const msgToSend = {
      message: message.trim(),
      roomchat_id: selectedLandId,
      user_id: userId,
      user_name: "คุณ", // หรือดึงจาก user login จริง
    };

    wsRef.current.send(JSON.stringify(msgToSend));

    // เคลียร์ input หลังส่ง
    setMessage("");
  };


  


  return (
    <>
      <Navbar />
      <div className="MainStyle">
        <div className="MassageRooms">
          <h3>รายการที่ดินของคุณ</h3>
          <select
            className="land-select"
            value={selectedLandId ?? ""}
            onChange={(e) => {
              setSelectedLandId(Number(e.target.value));
              setSelectedUser(null); // reset user when switch land
            }}
          >
            <option value="">เลือกที่ดินของคุณ</option>
            {landPosts.map((land) => (
              <option key={land.ID} value={land.ID}>
                {land.AdressLandplot} - {land.NumOfLandTitle}
              </option>
            ))}
          </select>
          <div className="post-detail">
            <img src={Picture} alt="รูปที่ดิน" className="land-image" />
          </div>

          {selectedLandId && (
            <>
              <h6>
                <strong>หมายเลขที่ดิน:</strong>{" "}
                {landPosts.find((land) => land.ID === selectedLandId)
                  ?.NumOfLandTitle ?? "ไม่พบข้อมูล"}
              </h6>
              <h6>
                <strong>ราคา:</strong>{" "}
                {landPosts.find((land) => land.ID === selectedLandId)?.Price ??
                  "ไม่พบข้อมูล"}
              </h6>
              <hr />
              <div className="user-list">
                <h5>เลือกผู้ใช้เพื่อดูข้อความ</h5>
                {uniqueUsers.length === 0 ? (
                  <p>ไม่มีคนแชท</p>
                ) : (
                  <ul>
                    {uniqueUsers.map((name, index) => (
                      <li
                        key={index}
                        onClick={() => setSelectedUser(name)}
                        style={{
                          cursor: "pointer",
                          fontWeight: selectedUser === name ? "bold" : "normal",
                          color: selectedUser === name ? "#0066cc" : "black",
                        }}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div className="MassageChat">
          <h2>ห้องแชท</h2>
          {selectedLandId ? (
            <>
              <div className="chat-window">
                {loading && <p>กำลังโหลดข้อความ...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!selectedUser && <p>กรุณาเลือกผู้ใช้เพื่อดูข้อความ</p>}
                {selectedUser &&
                 messages
                  .filter(msg => msg.roomchat_id === selectedLandId)
                  .map(msg => (
                    <div
                      key={msg.message_id}
                      className={`chat-message ${msg.user_id === userId ? "from-me" : "from-user"}`}
                    >
                      <div className="bubble">
                        <strong>{msg.user_name}</strong>: {msg.message}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความ..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <button onClick={sendMessage}>ส่ง</button>
              </div>
            </>
          ) : (
            <p>กรุณาเลือกที่ดินเพื่อเริ่มแชท</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Chat;
