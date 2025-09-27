// @ts-ignore
import { CheckSquareOutlined, CopyOutlined, SearchOutlined, AuditOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import Loader from "../../component/third-patry/Loader";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import { useState } from "react";
// @ts-ignore
import Logo from "../../assets/LogoLandchain.png";
import Landpic from "../../assets/LandPic.jpg";
import LandpicKorat from "../../assets/LandPicKorat.jpg"
import type { JSX } from "react";
import { Link } from 'react-router-dom';
import HeaderMain from "./HeaderMain";
const MainPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const goToRegisland = () => {
    setLoading(true);
    sessionStorage.setItem("isLogin", "true");
    setTimeout(() => {
      navigate("/user/regisland");
    }, 2000);
  };
  // @ts-ignore
  const goToLogin = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="main-container main-page-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      {/* Header */}
      <HeaderMain />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">บริการที่ดินออนไลน์</span>
          </h1>
          <p className="hero-subtitle">
            ตรวจสอบเอกสารสิทธิ์ นัดหมายกรมที่ดิน และลงทะเบียนโฉนดบน Blockchain
            <br />
            ด้วยเทคโนโลยีที่ทันสมัย ปลอดภัย และโปร่งใส
          </p>
        </div>
      </div>

      {/* Modern Search Section */}
      <div className="content-section">

        {/* Services Section */}
        <div className="section-header">
          <div className="section-badge">⚡ บริการของเรา</div>
          <h2 className="section-title">บริการครบวงจร</h2>
          <p className="section-subtitle">
            บริการที่ดินแบบ Digital ด้วยเทคโนโลยี Blockchain
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <CheckSquareOutlined />
            </div>
            <h3 className="service-title">ตรวจสอบโฉนดที่ดิน</h3>
            <p className="service-description">
              ตรวจสอบความถูกต้องของเอกสารโฉนดที่ดิน
              พร้อมข้อมูลประวัติที่โปร่งใส
            </p>
          </div>

          <Link to="/user/dashboard" style={{ textDecoration: 'none' }}>
            <div className="service-card">
              <div className="service-icon">
                <CopyOutlined />
              </div>
              <h3 className="service-title">คัดเอกสารออนไลน์</h3>
              <p className="service-description">
                ยื่นขอคัดสำเนาเอกสารที่ดินออนไลน์
                สะดวก รวดเร็ว ไม่ต้องเดินทาง
              </p>
            </div>
          </Link>

          <div className="service-card">
            <div className="service-icon">
              <AuditOutlined />
            </div>
            <h3 className="service-title">ลงทะเบียนโฉนด</h3>
            <p className="service-description">
              ลงทะเบียนโฉนดที่ดินในระบบ Digital
              เพื่อการจัดการที่ทันสมัย
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="steps-section">
          <div className="steps-container">
            <div className="section-header">
              <div className="section-badge">📋 ขั้นตอนการใช้งาน</div>
              <h2 className="section-title">ง่ายเพียง 3 ขั้นตอน</h2>
              <p className="section-subtitle">
                เริ่มต้นใช้งานระบบที่ดิน Digital ได้ง่ายๆ
              </p>
            </div>

            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <h4 className="step-title">กรอกข้อมูลและเลือกวัน</h4>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <h4 className="step-title">ยืนยันข้อมูลที่กรมที่ดิน</h4>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <h4 className="step-title">ใช้งานโฉนดอิเล็กทรอนิกส์</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="mt-3"><Loader /></div>}
    </div>
  );
};

export default MainPage;
