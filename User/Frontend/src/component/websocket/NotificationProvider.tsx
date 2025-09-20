import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { GetUserinfoByUserID } from "../../service/https/bam/bam";

interface Notification {
  Content: string;
  RoomID?: number;
  SenderID?: number;
  SenderName?: string;
  Type?: string;
}

interface NotificationContextProps {
  unread: { [key: string]: number };
  resetUnread: (key: string) => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  unread: {},
  resetUnread: () => {},
});

export const useNotification = () => useContext(NotificationContext);

interface Props {
  userID: number;
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<Props> = ({ userID, children }) => {
  const [unread, setUnread] = useState<{ [key: string]: number }>({});
  const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  const connectWS = () => {
    if (!userID) return;

    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`ws://192.168.1.173:8080/ws/notification/${userID}`);
    wsRef.current = ws;

    ws.onopen = () => console.log("Notification WS connected");

    ws.onclose = (e) => {
      console.log("Notification WS closed, reconnecting in 2s", e.reason);
      setTimeout(connectWS, 2000);
    };

    ws.onerror = (err) => {
      console.error("Notification WS error", err);
      ws.close();
    };

    ws.onmessage = async (event) => {
  const parsed = JSON.parse(event.data);

  const msg: Notification = {
    Content: parsed.Content,
    RoomID: parsed.RoomID,
    SenderID: parsed.SenderID,
    Type: parsed.Type,
  };

  let senderName = "Someone";

  if (msg.SenderID) {
    try {
      const userInfo = await GetUserinfoByUserID(msg.SenderID);
      if (userInfo && userInfo.length > 0) {
        const u = userInfo[0];
        senderName = `${u.Firstname} ${u.Lastname}`;
      }
    } catch (err) {
      console.error("Failed to fetch sender info", err);
    }
  }

  // กำหนดข้อความ toast สั้น ๆ
  // กำหนดข้อความ toast สั้น ๆ
let toastMessage = "";
const isImage =
  msg.Content.startsWith("http") &&
  /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.Content);
const isFile =
  msg.Content.startsWith("http") && !isImage; // ลิงก์แต่ไม่ใช่รูป

if (isImage) {
  toastMessage = `${senderName} ส่งรูปให้คุณ`;
} else if (isFile) {
  toastMessage = `${senderName} ส่งไฟล์ให้คุณ`;
} else {
  toastMessage = `${senderName} ส่งข้อความ: ${msg.Content}`;
}

// แสดง toast
toast(toastMessage, {
  position: "top-right",
  autoClose: 7000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  type: "info",
  style: {
    backgroundColor: "#1a202c",
    color: "#f7fafc",
    fontWeight: "600",
    fontSize: "14px",
    borderLeft: "5px solid #38b2ac",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  onClick: () => {
    if (msg.RoomID) navigate(`/user/chat/${msg.RoomID}`);
  },
});


  const key = msg.RoomID ? msg.RoomID.toString() : "global";
  setUnread((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
};


  };

  useEffect(() => {
    connectWS();
    return () => wsRef.current?.close();
  }, [userID]);

  const resetUnread = (key: string) => {
    setUnread((prev) => ({ ...prev, [key]: 0 }));
  };

  return (
    <NotificationContext.Provider value={{ unread, resetUnread }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};
