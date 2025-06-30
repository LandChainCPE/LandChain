import { useState } from "react";
import Loader from "../component/third-patry/Loader";

import { useNavigate } from "react-router-dom";

function UserMain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);  // เริ่มแสดง Loader
    setTimeout(() => {
      navigate("/regisland");  // เปลี่ยนหน้า
    }, 2000);  // ดีเลย์ 2 วินาที

  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "200px", backgroundColor: "#202C6B", display: "flex", flexDirection: "column", padding: "10px", height: "100vh", boxSizing: "border-box" }}>
        <img src="Logo2.png" alt="logo2myproject" style={{ maxWidth: "100%", height: "auto" }} />
        <button style={{ marginTop: "10px",width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          ตรวจสอบโฉนดที่ดิน
        </button>
        <button style={{ marginTop: "10px", width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          รายการจองคิว
        </button>
        <button style={{ marginTop: "10px",width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          โอนกรรมสิทธิ์
        </button>
        <button onClick={handleClick} style={{ marginTop: "10px",width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          ลงทะเบียนโฉนดที่ดิน
        </button>
    
      </div>
      <h1>MAIN</h1>



      {loading && <Loader />}
    </div>
  );

}
export default UserMain;