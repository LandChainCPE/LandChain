import { CheckSquareOutlined, CopyOutlined, SearchOutlined, AuditOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import Loader from "../../component/third-patry/Loader";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import { useState } from "react";
import Logo from "../../assets/LogoLandchain.png";
import Landpic from "../../assets/LandPic.jpg";
import LandpicKorat from "../../assets/LandPicKorat.jpg"
import type { JSX } from "react";
import { Link } from 'react-router-dom';
import HeaderMain from "./HeaderMain";
const MainPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const goToRegisland = () => {
    setLoading(true);
    sessionStorage.setItem("isLogin", "true");
    setTimeout(() => {
      navigate("/user/regisland");
    }, 2000);
  };

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
        <div className="search-section">
          <h2 className="search-title">🔍 ค้นหาที่ดินของคุณ</h2>

          <div className="filter-section">
            <div className="filter-group">
              <label className="filter-label">จังหวัด</label>
              <select className="filter-select">
                <option>เลือกจังหวัด</option>
                <option>กรุงเทพมหานคร</option>
                <option>นนทบุรี</option>
                <option>นครราชสีมา</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">ขนาดพื้นที่ (ตร.ว.)</label>
              <input className="filter-input" placeholder="ขนาดต่ำสุด" type="number" />
            </div>

            <div className="filter-group">
              <label className="filter-label">ถึง</label>
              <input className="filter-input" placeholder="ขนาดสูงสุด" type="number" />
            </div>

            <div className="filter-group">
              <label className="filter-label">ราคา (บาท)</label>
              <input className="filter-input" placeholder="ราคาต่ำสุด" type="number" />
            </div>

            <div className="filter-group">
              <label className="filter-label">ถึง</label>
              <input className="filter-input" placeholder="ราคาสูงสุด" type="number" />
            </div>

            <div className="filter-group button-group">
              <button className="search-btn-modern">
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        {/* Property Listings Section */}
        <div className="section-header">
          <div className="section-badge">🏞️ ประกาศขายที่ดิน</div>
          <h2 className="section-title">ที่ดินคุณภาพ</h2>
          <p className="section-subtitle">
            เลือกซื้อที่ดินจากประกาศที่ผ่านการตรวจสอบแล้ว
          </p>
        </div>

        <div className="property-grid">
          <div className="property-card">
            <img
              src={Landpic}
              alt="ที่ดินนนทบุรี"
              className="property-image"
            />
            <div className="property-content">
              <h3 className="property-title">🏞️ ที่ดินติดแม่น้ำ นนทบุรี</h3>
              <p className="property-location">2-3-43 ไร่ • ติดแม่น้ำเจ้าพระยา</p>

              <div className="property-tags">
                <span className="property-tag">ติดน้ำ</span>
                <span className="property-tag">วิวสวย</span>
              </div>

              <p className="property-price">💰 18,000,000 บาท</p>
              <p className="property-description">
                ที่ดินเหมาะสำหรับทำบ้านพักตากอากาศ เงียบสงบ บรรยากาศดี
                ติดแม่น้ำเจ้าพระยา มีท่าเรือส่วนตัว
              </p>
              <button className="property-btn">ดูรายละเอียด</button>
            </div>
          </div>

          <div className="property-card">
            <img
              src={LandpicKorat}
              alt="ที่ดินนครราชสีมา"
              className="property-image"
            />
            <div className="property-content">
              <h3 className="property-title">🏛️ ที่ดินติดถนนใหญ่ นครราชสีมา</h3>
              <p className="property-location">5-3-16 ไร่ • ติดถนนใหญ่</p>

              <div className="property-tags">
                <span className="property-tag">ติดถนน</span>
                <span className="property-tag">เหมาะธุรกิจ</span>
              </div>

              <p className="property-price">💰 35,000,000 บาท</p>
              <p className="property-description">
                ที่ดินเหมาะสำหรับทำธุรกิจ เดินทางสะดวก ใกล้ตลาดและโรงเรียน
                มีศักยภาพในการลงทุน
              </p>
              <button className="property-btn">ดูรายละเอียด</button>
            </div>
          </div>
        </div>
        {/* เอาไว้ใช้เวลาดึงข้อมูลจริงมาแสดง
          {data.map((item, index) => (
            <Col key={index} span={8}>
              <Card
                hoverable
                cover={<img alt="land" src={item.image} style={{ height: 200, objectFit: 'cover' }} />}
                style={{ fontFamily: 'Kanit', borderRadius: '12px' }}
              >
                <Title level={4}>{item.title}</Title>
                <Text type="secondary">{item.area} • {item.location}</Text>
                <br />
                <Text strong>ราคา: {item.price} บาท</Text>
                <p style={{ marginTop: 8 }}>{item.description}</p>
              </Card>
            </Col>
          ))}
          const data = [
            {
              title: "ขายที่ดิน นนทบุรี",
              location: "ติดแม่น้ำเจ้าพระยา",
              area: "2-3-43 ไร่",
              price: "18,000,000",
              description: "เหมาะสร้างบ้านพักตากอากาศ",
              image: "/images/land1.jpg"
            },
            ...
          ]
        */}

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
