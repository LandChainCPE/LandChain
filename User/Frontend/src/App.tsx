import React, { useState, useEffect } from "react";
import { NotificationProvider } from "./component/websocket/NotificationProvider";
import ConfigRoutes from "./routes/mainroute";
import { GetUserIDByWalletAddress } from "./service/https/bam/bam";

const App: React.FC = () => {
  const [userID, setUserID] = useState<number | null>(null);

  // ตัวอย่าง fetch userID จาก API
  useEffect(() => {
    const fetchUserID = async () => {
      const res = await GetUserIDByWalletAddress();
      setUserID(res.user_id)
    };
    fetchUserID();
  }, []);


  return (
    <NotificationProvider userID={userID}>
      <ConfigRoutes />
    </NotificationProvider>
  );
};

export default App;
