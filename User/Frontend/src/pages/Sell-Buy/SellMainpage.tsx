import { Link, useNavigate } from "react-router-dom";
import Loader from "../../component/third-patry/Loader";
import Navbar from "../../component/user/Navbar";
import { useState } from "react";
import Landpic from "../../assets/LandPic.jpg";
import './SellMainpage.css'

function SellMainPage() {
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
            <div className="navbar"> <Navbar /></div>
            <div className="picturecontainer"> <img src={Landpic} alt="แบนเนอร์เกี่ยวกับที่ดิน" className="Mainpicture" /> </div>
            {loading && <Loader />}

            <div className="SellLandContent">
                <div className="land-detail-area-price">
                    <div className="land-detail-area-tag">
                    <span className="land-detail-area">ขนาด 83.0 ตารางวา</span>
                    <span className="land-detail-tag">ติดน้ำ</span>
                    </div>
                    <span className="land-detail-price">18,000,000 บาท</span>
                    
                </div>
            </div>
            <hr />
        </div>
        
        
    );

}
export default SellMainPage;