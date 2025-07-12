import { useNavigate } from "react-router-dom";
import Loader from "../../component/third-patry/Loader";
import { useState } from "react";
import Navbar from "../../component/user/Navbar"; // ✅ ตรวจสอบ path ให้ตรงกับไฟล์ที่คุณมี

function Main() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const gotologin = () => {
    setLoading(true);
    localStorage.setItem("isLogin", "false");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const gotoregister = () => {
    setLoading(true);
    localStorage.setItem("isLogin", "false");
    setTimeout(() => {
      navigate("/register");
    }, 2000);
  };

  return (
    <div>
      <Navbar />

      <div className="container mt-5 text-center">
        <h1 className="mb-4">Main Page User</h1>
        <button className="btn btn-primary mx-2" onClick={gotologin}>
          Login
        </button>
        <button className="btn btn-success mx-2" onClick={gotoregister}>
          Register
        </button>
        {loading && <div className="mt-3"><Loader /></div>}
      </div>
    </div>
  );
}

export default Main;
