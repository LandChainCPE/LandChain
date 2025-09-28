// @ts-ignore
import React, { useState, useEffect } from "react";
import Navbar from "../../component/user/Navbar";
import "./appointmentstatus.css";
import { SearchOutlined } from "@ant-design/icons";
import { Check } from "lucide-react";
import { CheckVerifyWallet } from "../../service/https/jo";


// เพิ่ม interfaces สำหรับข้อมูลการจอง


const AppointmentStatus: React.FC = () => {

  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { response, result } = await CheckVerifyWallet(wallet);
      console.log("Response:", response);
      console.log("Result:", result);
      if (response.ok) {
        setResult(result);
      } else {
        setError(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      setError("เชื่อมต่อ backend ไม่สำเร็จ");
    }
    setLoading(false);
  };

  return (
    <div className="appointment-status-container">
      <Navbar />

      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">ตรวจสอบการยืนยันกระเป๋าตังของผู้ใช้</span>
          </h1>
          <p className="hero-subtitle">
            ตรวจสอบการยืนยัน wallet ของผู้ใช้เพื่อความปลอดภัยในการทำธุรกรรม
          </p>
        </div>
      </div>

      <div className="main-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-glow"></div>
          <div style={{ padding: "2rem" }}>
            <div className="section-header">
              <div className="form-icon">
                <SearchOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <span className="section-title">ตรวจสอบการยืนยันกระเป๋าตัง</span>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <input
                type="text"
                placeholder="กรอก Wallet Address..."
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid #6F969B",
                  width: "100%",
                  maxWidth: "400px",
                  fontSize: "1rem",
                  marginBottom: "1rem",
                }}
              />
              <button
                className="btn-modern"
                style={{ marginLeft: "0", minWidth: "150px" }}
                onClick={handleCheck}
                disabled={loading || !wallet}
              >
                {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
              </button>
            </div>
            {error && (
              <div style={{ color: "#d32f2f", marginTop: "1rem" }}>{error}</div>
            )}
            {result && (
              <div style={{ marginTop: "1rem", wordBreak: "break-all" }}>
                {result.match ? (
                  <div style={{
                    background: "linear-gradient(135deg, #D0E2E6 0%, #6F969B 100%)",
                    borderRadius: "16px",
                    padding: "2rem 1rem",
                    boxShadow: "0 8px 32px rgba(23, 46, 37, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#172E25",
                    fontWeight: 600,
                    fontSize: "1.2rem",
                  }}>
                    <Check size={48} color="#3F5658" style={{ marginBottom: "1rem" }} />
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#3F5658" }}>
                      ผู้ใช้รายนี้ <span style={{ color: "#2e7d32" }}>ยืนยันกระเป๋าตังกับกรมที่ดินแล้ว</span>
                    </div>
                    <div style={{ fontSize: "1rem", color: "#3F5658", marginBottom: "0.5rem" }}>
                      Wallet: <span style={{ fontWeight: 500 }}>{result.wallet}</span>
                    </div>
                    <div style={{ fontSize: "1rem", color: "#3F5658" }}>
                      NameHashSalt: <span style={{ fontWeight: 500 }}>{result.namehash_salt}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "1rem",
                    color: "#d32f2f",
                    fontWeight: 500,
                    boxShadow: "0 4px 16px rgba(23, 46, 37, 0.08)",
                  }}>
                    ไม่พบการยืนยันกระเป๋าตังกับกรมที่ดินสำหรับ Wallet นี้
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatus;
