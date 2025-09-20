// --- normalizeLand & addressText (เหมือน sellpostmain) ---
type Land = {
  ID: number;
  Name?: string;
  PhoneNumber?: string;
  Images?: string[];
  ProvinceID?: number;
  DistrictID?: number;
  SubdistrictID?: number;
  Price?: number;
  Tag?: string[];
  Province?: { NameTH?: string };
  District?: { NameTH?: string };
  Subdistrict?: { NameTH?: string };
  Area?: string;
  Landtitle?: {
    Rai?: number;
    Ngan?: number;
    SquareWa?: number;
    TitleDeedNumber?: string;
  };
};

function normalizeLand(item: any): Land {
  const extractTags = (raw: any, tagsArr: any): string[] | undefined => {
    let result: string[] = [];
    if (raw) {
      if (Array.isArray(raw)) {
        result = raw.map((t) => t?.Tag ?? t?.tag ?? t?.name ?? t?.Name).filter(Boolean);
      } else {
        const one = raw?.Tag ?? raw?.tag ?? raw?.name ?? raw?.Name;
        if (one) result.push(one);
      }
    }
    if (Array.isArray(tagsArr)) {
      result = result.concat(
        tagsArr.map((t: any) => t?.Tag ?? t?.tag ?? t?.name ?? t?.Name).filter(Boolean)
      );
    }
    return result.length ? result : undefined;
  };

  let images: string[] = [];
  if (Array.isArray(item.Photoland) && item.Photoland.length > 0) {
    images = item.Photoland.map((p: any) => p.Path).filter(Boolean);
  } else if (item.image ?? item.Image) {
    images = [item.image ?? item.Image];
  }

  const provinceObj = item.province ?? item.Province ?? item.ProvinceTH ?? item.provinceTH ?? undefined;
  const districtObj = item.district ?? item.District ?? undefined;
  const subdistrictObj = item.subdistrict ?? item.Subdistrict ?? undefined;
  const landtitleObj = item.landtitle ?? item.Landtitle ?? undefined;

  return {
    ID: item.id ?? item.ID,
    Name: item.name ?? item.Name,
    PhoneNumber: item.phone_number ?? item.PhoneNumber,
    Images: images,
    ProvinceID: item.province_id ?? item.ProvinceID,
    DistrictID: item.district_id ?? item.DistrictID,
    SubdistrictID: item.subdistrict_id ?? item.SubdistrictID,
    Price: item.price ?? item.Price,
    Tag: extractTags(item.tag ?? item.Tag, item.tags ?? item.Tags),
    Province: provinceObj ? { NameTH: provinceObj.name_th ?? provinceObj.NameTH } : undefined,
    District: districtObj ? { NameTH: districtObj.name_th ?? districtObj.NameTH } : undefined,
    Subdistrict: subdistrictObj ? { NameTH: subdistrictObj.name_th ?? subdistrictObj.NameTH } : undefined,
    Area: item.area ?? item.Area,
    Landtitle: landtitleObj ? {
      Rai: landtitleObj.rai ?? landtitleObj.Rai,
      Ngan: landtitleObj.ngan ?? landtitleObj.Ngan,
      SquareWa: landtitleObj.square_wa ?? landtitleObj.SquareWa,
      TitleDeedNumber: landtitleObj.title_deed_number ?? landtitleObj.TitleDeedNumber,
    } : undefined,
  };
}

function addressText(land: Land) {
  return [land.Subdistrict?.NameTH, land.District?.NameTH, land.Province?.NameTH]
    .filter(Boolean)
    .join(", ");
}
import { CheckSquareOutlined, CopyOutlined, SearchOutlined, AuditOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import Loader from "../../component/third-patry/Loader";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import { useState, useEffect } from "react";
import Logo from "../../assets/LogoLandchain.png";
import { GetAllPostLandData } from "../../service/https/jib/jib";

import Landpic from "../../assets/LandPic.jpg";
import LandpicKorat from "../../assets/LandPicKorat.jpg"
import type { JSX } from "react";
import { Link } from 'react-router-dom';
import Navbar from "../../component/user/Navbar";
const MainPageAfterLogin = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lands, setLands] = useState<Land[]>([]);
  const [landsLoading, setLandsLoading] = useState(true);
  const [provinceFilter, setProvinceFilter] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [filteredLands, setFilteredLands] = useState<Land[]>([]);
  useEffect(() => {
    setLandsLoading(true);
    GetAllPostLandData()
      .then((data) => {
        const mapped = Array.isArray(data) ? data.map(normalizeLand) : [];
        setLands(mapped);
      })
      .catch(() => setLands([]))
      .finally(() => setLandsLoading(false));
  }, []);

  // ฟิลเตอร์ข้อมูลเมื่อ lands หรือ filter เปลี่ยน
  useEffect(() => {
    let result = lands;
    if (provinceFilter) {
      result = result.filter(l => l.Province?.NameTH === provinceFilter);
    }
    const min = priceMin !== '' && !isNaN(Number(priceMin)) ? Number(priceMin) : undefined;
    const max = priceMax !== '' && !isNaN(Number(priceMax)) ? Number(priceMax) : undefined;
    if (min !== undefined) {
      result = result.filter(l => typeof l.Price === 'number' && l.Price >= min);
    }
    if (max !== undefined) {
      result = result.filter(l => typeof l.Price === 'number' && l.Price <= max);
    }
    setFilteredLands(result);
  }, [lands, provinceFilter, priceMin, priceMax]);

  const goToRegisland = () => {
    setLoading(true);
    localStorage.setItem("isLogin", "true");
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
      <Navbar />

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
              <select className="filter-select" value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)}>
                <option value="">เลือกจังหวัด</option>
                {/* province options from lands */}
                {[...new Set(lands.map(l => l.Province?.NameTH).filter(Boolean))].map((prov, idx) => (
                  <option key={idx} value={prov as string}>{prov}</option>
                ))}
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
              <input className="filter-input" placeholder="ราคาต่ำสุด" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
            </div>

            <div className="filter-group">
              <label className="filter-label">ถึง</label>
              <input className="filter-input" placeholder="ราคาสูงสุด" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
            </div>

            <div className="filter-group button-group">
              <button className="search-btn-modern" type="button" onClick={() => {}}>
                ค้นหา
              </button>
              {provinceFilter || priceMin || priceMax ? (
                <button type="button" className="search-btn-modern" style={{ marginLeft: 8, background: '#e5e7eb', color: '#374151' }} onClick={() => { setProvinceFilter(''); setPriceMin(''); setPriceMax(''); }}>
                  ล้างตัวกรอง
                </button>
              ) : null}
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

        {/* แสดงที่ดินเป็นแถวแนวนอนเลื่อนได้ */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0, flex: 1 }}>รายการที่ดินล่าสุด</h3>
          <button
            className="property-btn"
            style={{ minWidth: 120, marginLeft: 16 }}
            onClick={() => navigate('/user/sellpostmain')}
          >ดูเพิ่มเติม</button>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'flex', gap: 24, minHeight: 320 }}>
            {landsLoading ? (
              <div style={{ padding: 48, textAlign: 'center', width: 300 }}>กำลังโหลด...</div>
            ) : filteredLands.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', width: 300 }}>ไม่มีประกาศขายที่ดิน</div>
            ) : (
              filteredLands.slice(0, 10).map((land, idx) => {
                const img = land.Images && land.Images.length > 0 ? land.Images[0] : Landpic;
                return (
                  <div
                    key={land.ID || idx}
                    className="property-card"
                    style={{ minWidth: 320, maxWidth: 340, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    onClick={() => navigate(`/user/landdetail/${land.ID}`)}
                  >
                    <img
                      src={img}
                      alt={land.Name || 'ชื่อที่ดินไม่ระบุ'}
                      className="property-image"
                      style={{ height: 180, objectFit: 'cover', borderRadius: 12 }}
                      onError={e => { (e.target as HTMLImageElement).src = Landpic; }}
                    />
                    <div className="property-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3 className="property-title" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{land.Name || 'ชื่อที่ดินไม่ระบุ'}</h3>
                      <p className="property-location" style={{ fontSize: 14, color: '#3F5658', margin: 0 }}>{addressText(land) || 'ไม่ระบุที่อยู่'}</p>
                      {land.Landtitle && (
                        <div style={{ fontSize: 13, color: '#2563eb', margin: '4px 0' }}>
                          📏 {[
                            land.Landtitle.Rai && `${land.Landtitle.Rai} ไร่`,
                            land.Landtitle.Ngan && `${land.Landtitle.Ngan} งาน`,
                            land.Landtitle.SquareWa && `${land.Landtitle.SquareWa} ตร.วา`,
                          ].filter(Boolean).join(' ') || 'ไม่ระบุขนาด'}
                        </div>
                      )}
                      {land.Tag && land.Tag.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '2px 0' }}>
                          {land.Tag.slice(0, 3).map((tag, idx) => (
                            <span key={idx} style={{ background: '#f3e8ff', color: '#7c3aed', borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #e9d5ff' }}>{tag}</span>
                          ))}
                          {land.Tag.length > 3 && (
                            <span style={{ background: '#f3f4f6', color: '#4b5563', borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                              +{land.Tag.length - 3} เพิ่มเติม
                            </span>
                          )}
                        </div>
                      )}
                      <p className="property-price" style={{ fontWeight: 600, color: '#059669', fontSize: 16, margin: '6px 0 0 0' }}>
                        {land.Price ? `฿${Number(land.Price).toLocaleString()}` : 'ไม่ระบุราคา'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
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

          <Link to="/user/petition" style={{ textDecoration: 'none' }}>
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

export default MainPageAfterLogin;
