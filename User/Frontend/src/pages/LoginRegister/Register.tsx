import { useState } from "react";
import Loader from "../../component/third-patry/Loader";

import { useNavigate } from "react-router-dom";

function UserMain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const gotomainuser = () => {
    setLoading(true);  // เริ่มแสดง Loader
    localStorage.setItem("isLogin", "true");
    setTimeout(() => {
      navigate("/user/main");  // เปลี่ยนหน้า
    }, 2000);  // ดีเลย์ 2 วินาที
  };

  return (
    <div>
      <h1>Register</h1>
      <button onClick={gotomainuser} style={{ height: "50px", width: "100px" }}>
        gotoMainUser
      </button>
      {loading && <Loader />}
    </div>
  );

}
export default UserMain;