import { useNavigate } from "react-router-dom";
import Loader from "../../component/third-patry/Loader";
import Navbar from "../../component/user/Navbar";
import { useState } from "react";
import Landpic from "../../assets/LandPic.jpg";
// @ts-ignore
import { GetAllPostLandData } from "../../service/https/jib/jib";

function SellMainPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // สถานะการโหลด

  // ฟังก์ชันไปยังหน้า /user/main
  // @ts-ignore
  const gotomainuser = () => {
    setLoading(true);
    sessionStorage.setItem("isLogin", "true");
    setTimeout(() => {
      navigate("/user/main");
    }, 2000);
  };

  // สไตล์การ์ด
  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    overflow: "hidden",
    margin: "5px",
    transition: "all 0.3s ease",
    border: "1px solid #e0e0e0",
  };

  // สไตล์รูปภาพการ์ด
  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "300px",
    objectFit: "cover", // use 'cover' explicitly
    transition: "transform 0.3s ease",
  };

  // สไตล์เนื้อหาภายในการ์ด
  const contentStyle = {
    padding: "24px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "16px",
    fontFamily: "Arial, sans-serif",
  };

  const sizeContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap", // change this to 'wrap' or 'nowrap'
  };

  const sizeItemStyle = {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #bbdefb",
  };

  const priceStyle = {
    fontSize: "32px",
    fontWeight: "800",
    color: "#e74c3c",
    marginBottom: "16px",
    fontFamily: "Arial, sans-serif",
  };

  const tagsContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap", // change this to 'wrap' or 'nowrap'
  };

  const tagStyle = {
    backgroundColor: "#e8f5e8",
    color: "#2e7d32",
    padding: "8px 16px",
    borderRadius: "25px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #c8e6c9",
  };

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    paddingBottom: "40px",
  };

  // เพิ่มสไตล์ Grid สำหรับจัดการการ์ดใน 3 คอลัมน์
  const cardsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // จัดแสดง 3 การ์ดต่อแถว
    gap: "20px", // ระยะห่างระหว่างการ์ด
    padding: "20px",
    justifyItems: "center", // จัดการ์ดให้อยู่ตรงกลาง
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "20px" }}>
        <Navbar />
      </div>

      {loading && <Loader />} {/* ถ้า loading ให้แสดง Loader */}

      {/* การแสดงการ์ด */}
      <div style={cardsContainerStyle}>
        {[...Array(3)].map((_, index) => (
          <div style={cardStyle} key={index}>
            <div style={{ position: "relative" }}>
              <img src={Landpic} alt="ที่ดินขาย" style={imageStyle} />
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                ขาย
              </div>
            </div>

            <div style={contentStyle}>
              <h2 style={titleStyle}>ขายที่ดิน นครราชสีมา</h2>

              <div style={sizeContainerStyle}>
                <span style={sizeItemStyle}>📏 83.0 ตร.วา</span>
              </div>

              <div style={priceStyle}>฿18,000,000</div>

              <div style={tagsContainerStyle}>
                <span style={tagStyle}>💧 ติดน้ำ</span>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h4
                  style={{
                    color: "#495057",
                    fontSize: "16px",
                    marginBottom: "12px",
                    fontWeight: "600",
                  }}
                >
                  รายละเอียดเพิ่มเติม
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "8px",
                    fontSize: "14px",
                    color: "#6c757d",
                  }}
                >
                  <div>📍 <strong>ที่ตั้ง:</strong> นครราชสีมา</div>
                  <div>🚗 <strong>การเดินทาง:</strong> สะดวก</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                {/* ปุ่มติดต่อเจ้าของที่ไม่ต้องการสถานะ */}
                <button
                  style={{
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "25px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
                  }}
                >
                  📞 ติดต่อเจ้าของ
                </button>

                <button
                  style={{
                    backgroundColor: "#2ecc71",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "25px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(46, 204, 113, 0.3)",
                  }}
                >
                  🛍️ ซื้อ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellMainPage;
