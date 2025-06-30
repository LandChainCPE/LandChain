import { Link, useNavigate } from "react-router-dom";
import Loader from "../../component/third-patry/Loader";
import { useState } from "react";
function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const handleClick = () => {
    setLoading(true);  // เริ่มแสดง Loader
    localStorage.setItem("isLogin", "true");

    setTimeout(() => {
      navigate("/main");  // เปลี่ยนหน้า
    }, 2000);  // ดีเลย์ 2 วินาที
    
  };

    return (
        <div>
            <h1>Login</h1>
            <button onClick={handleClick} style={{ height: "50px", width: "100px" }}>
                Go to Main Pages
            </button>

            {loading && <Loader />}
        </div>
    );

}
export default Login;