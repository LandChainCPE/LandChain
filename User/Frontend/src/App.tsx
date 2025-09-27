import React, { useState, useEffect } from "react";
import { NotificationProvider } from "./component/websocket/NotificationProvider";
import ConfigRoutes from "./routes/mainroute";
import { GetUserIDByWalletAddress } from "./service/https/bam/bam";

const App: React.FC = () => {
  // ดึงค่า isLogin จาก sessionStorage
  const isLoginRaw = sessionStorage.getItem("isLogin");

  // ยังไม่ถูกเซ็ต → consider ยังไม่ล็อกอิน
  const isLoggedIn = isLoginRaw === "true";

  const [userID, setUserID] = useState<number | null>(null);
  const [checkedLogin, setCheckedLogin] = useState(false); // flag สำหรับเช็คว่าเช็ค session แล้ว

  useEffect(() => {
    // mark ว่าเช็ค session แล้ว
    setCheckedLogin(true);

    if (!isLoggedIn) return; // ถ้ายังไม่ล็อกอิน หรือยังไม่มีค่า → ไม่ fetch

    let isMounted = true;
    const fetchUserID = async () => {
      try {
        const res = await GetUserIDByWalletAddress();
        if (isMounted) setUserID(res.user_id);
      } catch (err) {
        console.error("Failed to fetch user ID", err);
      }
    };
    fetchUserID();
    return () => { isMounted = false; };
  }, [isLoggedIn]);

  // ถ้ายังไม่เช็ค session → อาจ render loading หรือ null
  if (!checkedLogin) return null;

  return (
    isLoggedIn ? (
      userID !== null ? (
        <NotificationProvider userID={userID}>
          <ConfigRoutes />
        </NotificationProvider>
      ) : null // รอ fetch userID
    ) : (
      <ConfigRoutes /> // ไม่ล็อกอิน → render ConfigRoutes ปกติ
    )
  );
};

export default App;
