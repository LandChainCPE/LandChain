import { Link, useNavigate } from "react-router-dom";
import Loader from "../../component/third-patry/Loader";
import { useState } from "react";
function Main() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const gotologin = () => {
    setLoading(true);  // เริ่มแสดง Loader
    localStorage.setItem("isLogin", "false");
    setTimeout(() => {
      navigate("/login");  // เปลี่ยนหน้า
    }, 2000);  // ดีเลย์ 2 วินาที
  };

  const gotoregister = () => {
    setLoading(true);  // เริ่มแสดง Loader
    localStorage.setItem("isLogin", "false");
    setTimeout(() => {
      navigate("/register");  // เปลี่ยนหน้า
    }, 2000);  // ดีเลย์ 2 วินาที
  };

  return (
    <div>
      <h1>MainPageUser</h1>
      <button onClick={gotologin} style={{ height: "50px", width: "100px" }}>
        gotologin
      </button>
      <button onClick={gotoregister} style={{ height: "50px", width: "100px" }}>
        gotoregister
      </button>
      
      {loading && <Loader />}
    </div>
  );

}
export default Main;