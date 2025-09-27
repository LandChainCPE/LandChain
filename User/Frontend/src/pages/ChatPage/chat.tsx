// @ts-ignore
import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../component/user/Navbar";
import "./Chat.css";
import {
  GetAllRoomMessagesByUserID,
  GetUserIDByWalletAddress,
  GetRoomMessages,
  UploadImage,
} from "../../service/https/bam/bam";
import { useParams } from "react-router-dom";

interface Message {
  ID: number;
  SenderID: number;
  Content: any;
  RoomID?: number;
  Type?: "text" | "image" | "file";
  CreatedAt?: string;
}

interface Room {
  ID: number;
  User1ID: number;
  User2ID: number;
  User1: { Firstname: string; Lastname: string };
  User2: { Firstname: string; Lastname: string };
}

const MESSAGES_LIMIT = 20;
const MAX_FILE_SIZE_MB = 5;

const Chat = () => {
  const [contacts, setContacts] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userID, setUserID] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roomOffsets, setRoomOffsets] = useState<{ [roomID: number]: number }>({});
  const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: number }>({});
  const { roomID } = useParams<{ roomID: string }>();
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load selected room messages when roomID or contacts change
  useEffect(() => {
    if (!roomID || contacts.length === 0) return;
    const room = contacts.find((r) => r.ID === Number(roomID));
    if (room) {
      setSelectedRoom(room);
      loadMessages(room.ID, false, 0);
      setUnreadMessages((prev) => ({ ...prev, [room.ID]: 0 }));
    }
  }, [roomID, contacts]);

  // Fetch userID and all rooms
  useEffect(() => {
    const fetchUserIDAndRooms = async () => {
      try {
        const userRes = await GetUserIDByWalletAddress();
        const id = userRes?.user_id;
        if (!id) throw new Error("User ID not found");
        setUserID(id);

        const roomRes = await GetAllRoomMessagesByUserID(id);
        setContacts(roomRes.messages || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserIDAndRooms();
  }, []);

  // Notification WebSocket
  useEffect(() => {
    if (!userID) return;

    const ws = new WebSocket(`wss://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io/:8080/ws/notification/${userID}`);

    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      const roomIDFromMsg = msg.RoomID ?? null;

      if (selectedRoom && roomIDFromMsg === selectedRoom.ID) {
        return;
      }

      setUnreadMessages(prev => {
        const key = roomIDFromMsg ? roomIDFromMsg.toString() : "global";
        const prevCount = prev[key] || 0;
        return { ...prev, [key]: prevCount + 1 };
      });
    };

    ws.onclose = () => console.log("Notification WS closed");
    ws.onerror = (err) => console.error("Notification WS error", err);

    return () => ws.close();
  }, [userID, selectedRoom]);

  // Chat WebSocket
  useEffect(() => {
    if (!selectedRoom || !userID) return;

    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(
      `wss://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io/:8080/ws/chat/${selectedRoom.ID}/${userID}`

    );

    ws.onopen = () => console.log("Connected to Chat WS");

    ws.onmessage = (event) => {
      let newMsg: Message;
      try {
        newMsg = JSON.parse(event.data);
        if (!newMsg.ID) newMsg.ID = Date.now() + Math.floor(Math.random() * 1000);
        if (!newMsg.Type) {
          if (typeof newMsg.Content === "string") {
            if (
              newMsg.Content.startsWith("https") &&
              /\.(jpg|jpeg|png|gif|webp)$/i.test(newMsg.Content)
            ) {
              newMsg.Type = "image";
            } else if (newMsg.Content.startsWith("https")) {
              newMsg.Type = "file";
            } else {
              newMsg.Type = "text";
            }
          } else {
            newMsg.Type = "text";
          }
        }
      } catch {
        newMsg = {
          ID: Date.now() + Math.floor(Math.random() * 1000),
          SenderID: 0,
          Content: event.data,
          RoomID: selectedRoom.ID,
          Type: "text",
        };
      }

      if (newMsg.SenderID === userID) return;

      setMessages(prev => {
        if (prev.some(m => m.ID === newMsg.ID)) return prev;
        return [...prev, newMsg];
      });
      scrollToBottom();
    };

    ws.onerror = (err) => console.error("Chat WS error:", err);
    ws.onclose = () => console.log("Chat WS closed");

    wsRef.current = ws;
    return () => ws.close();
  }, [selectedRoom, userID]);

  // Load messages with pagination
  const loadMessages = async (
    roomID: number,
    appendTop = false,
    offsetParam?: number
  ) => {
    if (loading) return;
    setLoading(true);
    const offsetToUse = offsetParam ?? roomOffsets[roomID] ?? 0;
    try {
      const res = await GetRoomMessages(roomID, MESSAGES_LIMIT, offsetToUse);
      const fetchedMessages: Message[] = res.messages || [];
      if (fetchedMessages.length < MESSAGES_LIMIT) setHasMore(false);

      const container = messagesContainerRef.current;
      const scrollHeightBefore = container?.scrollHeight || 0;

      setMessages((prev) =>
        appendTop ? [...fetchedMessages, ...prev] : [...prev, ...fetchedMessages]
      );

      setRoomOffsets((prev) => ({
        ...prev,
        [roomID]: offsetToUse + fetchedMessages.length,
      }));

      if (appendTop && container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - scrollHeightBefore;
        }, 50);
      } else {
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = async (room: Room) => {
    setSelectedRoom(room);
    setMessages([]);
    setHasMore(true);
    await loadMessages(room.ID, false, 0);
    setUnreadMessages((prev) => ({ ...prev, [room.ID]: 0, global: 0 }));
  };

  const handleSendMessage = async () => {
    if (!wsRef.current || !selectedRoom || !userID) return;

    const messagesToSend: Message[] = [];

    if (selectedFile) {
      try {
        const res = await UploadImage(selectedRoom.ID, userID, selectedFile);
        if (!res?.url) throw new Error("Upload failed");

        messagesToSend.push({
          ID: Date.now() + Math.floor(Math.random() * 1000),
          SenderID: userID,
          Content: res.url,
          RoomID: selectedRoom.ID,
          Type: res.type || "file",
        });
      } catch (err) {
        console.error("File upload error:", err);
      }
    }

    if (newMessage.trim()) {
      messagesToSend.push({
        ID: Date.now() + Math.floor(Math.random() * 1000),
        SenderID: userID,
        Content: newMessage,
        RoomID: selectedRoom.ID,
        Type: "text",
      });
    }

    const targetUserID =
      selectedRoom.User1ID === userID ? selectedRoom.User2ID : selectedRoom.User1ID;

    for (const msg of messagesToSend) {
      wsRef.current.send(JSON.stringify(msg));
      setMessages((prev) => [...prev, msg]);

      try {
        await fetch("https://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io/:8080/notification/send", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUserID,
            message: msg.Type === "file" ? `[File] ${msg.Content}` : msg.Content,
            senderID: userID,
            roomID: selectedRoom.ID,
            type: msg.Type === "text" ? "chat_message" : msg.Type,
          }),
        });
      } catch (err) {
        console.error("BroadcastNotification failed:", err);
      }
    }

    setNewMessage("");
    setSelectedFile(null);
    setTimeout(scrollToBottom, 50);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(`File too large! Max ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    setSelectedFile(file);
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current || !selectedRoom) return;
    if (messagesContainerRef.current.scrollTop === 0 && hasMore && !loading) {
      loadMessages(selectedRoom.ID, true);
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.Type === "image") {
      return (
        <img
          src={msg.Content}
          alt="sent"
        />
      );
    }

    if (msg.Type === "file") {
      const fileName = msg.Content.split("/").pop();
      return (
        <a href={msg.Content} target="_blank" rel="noopener noreferrer">
          📎 {fileName}
        </a>
      );
    }

    if (typeof msg.Content === "string") {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = msg.Content.split(urlRegex);

      return parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        } else {
          return <span key={index}>{part}</span>;
        }
      });
    }

    return msg.Content;
  };

  const getContactInitials = (contact: { Firstname: string; Lastname: string }) => {
    return `${contact.Firstname.charAt(0)}${contact.Lastname.charAt(0)}`.toUpperCase();
  };

  const getSelectedUserInitials = () => {
    if (!selectedRoom || !userID) return "";
    const contactUser = selectedRoom.User1ID === userID ? selectedRoom.User2 : selectedRoom.User1;
    return getContactInitials(contactUser);
  };

  return (
    <div className="chat-container">
      <div className="chat-floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
      </div>

      <Navbar />

      <div className="chat-main-layout">
        {/* Contacts Sidebar */}
        <div className="chat-contacts">
          <div className="contacts-header">
            <h3 className="contacts-title">Messages</h3>
            <p className="contacts-subtitle">Your conversations</p>
          </div>

          {contacts.length > 0 ? (
            contacts.map((room) => {
              const contactUser = room.User1ID === userID ? room.User2 : room.User1;
              const unreadCount = unreadMessages[room.ID] || 0;

              return (
                <div
                  key={room.ID}
                  onClick={() => handleSelectRoom(room)}
                  className={`contact-item ${selectedRoom?.ID === room.ID ? "active" : ""}`}
                >
                  <div className="contact-info">
                    <div className="contact-avatar">
                      {getContactInitials(contactUser)}
                    </div>
                    <div className="contact-details">
                      <div className="contact-name">
                        {contactUser.Firstname} {contactUser.Lastname}
                      </div>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="unread-badge">
                      {unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-contacts">No contacts found.</div>
          )}
        </div>

        {/* Chat Room */}
        <div className="chat-room">
          {selectedRoom ? (
            <>
              <div className="chat-header">
                <div className="chat-header-content">
                  <div className="chat-avatar-large">
                    {getSelectedUserInitials()}
                  </div>
                  <div className="chat-user-info">
                    <h4>
                      {selectedRoom.User1ID === userID
                        ? `${selectedRoom.User2.Firstname} ${selectedRoom.User2.Lastname}`
                        : `${selectedRoom.User1.Firstname} ${selectedRoom.User1.Lastname}`}
                    </h4>

                  </div>
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="chat-messages"
              >
                <div className="chat-messages-content">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div
                        key={`${msg.ID}-${index}`}
                        className={`message-wrapper ${msg.SenderID === userID ? "own" : "other"}`}
                      >
                        <div className="message-bubble">
                          <div className="message-content">
                            {renderMessageContent(msg)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                {selectedFile && (
                  <div className="file-preview">
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(selectedFile.name) ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="preview"
                        onClick={() => window.open(URL.createObjectURL(selectedFile))}
                      />
                    ) : (
                      <a
                        href={URL.createObjectURL(selectedFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📎 {selectedFile.name}
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="remove-file-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="input-controls">
                  <textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    maxLength={200}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="message-input"
                  />

                  <div className="input-meta">
                    <div className="char-count">
                      {newMessage.length} / 200
                    </div>

                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="file-input"
                      />
                      <div className="file-size-limit">
                        Max {MAX_FILE_SIZE_MB}MB
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className="send-btn"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="chat-empty-state">
              <div className="empty-state-icon">💬</div>
              <h3 className="empty-state-title">Select a conversation</h3>
              <p className="empty-state-message">
                Choose from your existing conversations, or start a new one.
                {unreadMessages.global > 0 && (
                  <span className="global-unread">
                    {unreadMessages.global}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;