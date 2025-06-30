import { useState } from "react";
import Loader from "../../component/third-patry/Loader";

import { useNavigate } from "react-router-dom";

function UserMain() {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const handleClick = () => {
    setLoading(true);  // เริ่มแสดง Loader
    localStorage.setItem("isLogin", "");

    setTimeout(() => {
      navigate("/main");  // เปลี่ยนหน้า
    }, 5000);  // ดีเลย์ 2 วินาที
    
  };

    return (
        <div>
            <h1>UserMain</h1>
            <button onClick={handleClick} style={{ height: "50px", width: "100px" }}>
                Go to Login Pages
            </button>

            {loading && <Loader />}
        </div>
    );

}
export default UserMain;