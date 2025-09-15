import { CheckSquareOutlined, CopyOutlined, EnvironmentOutlined, SearchOutlined, AuditOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Select, Form, Tag, Pagination, Steps } from "antd";
import Loader from "../../component/third-patry/Loader";
import "./MainPage.css";
import { useState } from "react";
import Landpic from "../../assets/LandPic.jpg";
import LandpicKorat from "../../assets/LandPicKorat.jpg"
import type { JSX } from "react";
import { Link } from 'react-router-dom';
import Header from "./HeaderMain";

const { Option } = Select;
const { Step } = Steps;

const MainPage = (): JSX.Element => {
  const [loading] = useState(false);

  return (
    <div className="main-container">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            บริการกรมที่ดินออนไลน์
          </h1>
          <h2 className="hero-subtitle">
            ระบบจัดการที่ดินด้วยเทคโนโลยี Blockchain
          </h2>
          <p className="hero-description">
            ตรวจสอบเอกสารสิทธิ์ นัดหมายส่งมอบที่ดิน และยืนยันความถูกต้องด้วยเทคโนโลยีที่ทันสมัย
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-form">
            <div className="search-input-group">
              <Input
                className="search-input"
                placeholder="ค้นหาเลขโฉนด หรือ เลขที่ดิน"
                size="large"
                prefix={<SearchOutlined />}
              />
              <Button className="search-button" size="large">
                ค้นหา
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="filter-container">
          <Form layout="vertical" className="filter-form">
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12} md={6} lg={4}>
                <Form.Item label="จังหวัด">
                  <Select 
                    defaultValue="เลือกจังหวัด" 
                    size="large" 
                    className="filter-select"
                  >
                    <Option value="กรุงเทพฯ">กรุงเทพฯ</Option>
                    <Option value="นนทบุรี">นนทบุรี</Option>
                    <Option value="นครราชสีมา">นครราชสีมา</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Form.Item label="ขนาดพื้นที่">
                  <Input.Group compact>
                    <Input
                      className="filter-input"
                      style={{ width: '60%' }}
                      placeholder="จาก"
                      size="large"
                    />
                    <Select defaultValue="ตร.ว" size="large" style={{ width: '40%' }}>
                      <Option value="ตร.ว">ตร.ว</Option>
                      <Option value="ไร่">ไร่</Option>
                      <Option value="งาน">งาน</Option>
                    </Select>
                  </Input.Group>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Form.Item label="ถึง">
                  <Input.Group compact>
                    <Input
                      className="filter-input"
                      style={{ width: '60%' }}
                      placeholder="ถึง"
                      size="large"
                    />
                    <Select defaultValue="ตร.ว" size="large" style={{ width: '40%' }}>
                      <Option value="ตร.ว">ตร.ว</Option>
                      <Option value="ไร่">ไร่</Option>
                      <Option value="งาน">งาน</Option>
                    </Select>
                  </Input.Group>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6} lg={3}>
                <Form.Item label="ราคาต่ำสุด">
                  <Input
                    className="filter-input"
                    placeholder="ราคาต่ำสุด"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6} lg={3}>
                <Form.Item label="ราคาสูงสุด">
                  <Input
                    className="filter-input"
                    placeholder="ราคาสูงสุด"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={12} lg={2}>
                <Form.Item label=" ">
                  <Button className="search-button" size="large" block>
                    ค้นหา
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </section>

      {/* Property Listings Section */}
      <section className="content-section">
        <div className="section-container">
          <h2 className="section-title">ประกาศขายที่ดิน</h2>
          
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={24} md={12} lg={10} xl={10}>
              <div className="property-card fade-in">
                <div className="property-image">
                  <img alt="ที่ดินนนทบุรี" src={Landpic} />
                </div>
                <div className="property-content">
                  <h3 className="property-title">
                    <EnvironmentOutlined /> ขายที่ดิน นนทบุรี
                  </h3>
                  <p className="property-specs">2-3-43 ไร่ • ติดแม่น้ำเจ้าพระยา</p>
                  <div className="property-tags">
                    <Tag color="blue">ติดน้ำ</Tag>
                  </div>
                  <p className="property-price">18 ล้านบาท</p>
                  <p className="property-description">
                    ที่ดินเหมาะสำหรับทำบ้านพักตากอากาศ เงียบสงบ บรรยากาศดี
                  </p>
                  <Button className="property-button" type="link">
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={24} md={12} lg={10} xl={10}>
              <div className="property-card fade-in">
                <div className="property-image">
                  <img alt="ที่ดินนครราชสีมา" src={LandpicKorat} />
                </div>
                <div className="property-content">
                  <h3 className="property-title">
                    <EnvironmentOutlined /> ขายที่ดิน นครราชสีมา
                  </h3>
                  <p className="property-specs">5-3-16 ไร่ • ติดถนนใหญ่</p>
                  <div className="property-tags">
                    <Tag color="green">ติดถนน</Tag>
                  </div>
                  <p className="property-price">35 ล้านบาท</p>
                  <p className="property-description">
                    ที่ดินเหมาะสำหรับทำบ้านที่อยู่อาศัย เดินทางสะดวก ใกล้ตลาดและโรงเรียน
                  </p>
                  <Button className="property-button" type="link">
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="pagination-wrapper">
            <Pagination defaultCurrent={1} total={50} />
          </div>
        </div>
      </section>

      {/* Services and PR Section */}
      <section className="services-section">
        <div className="section-container">
          <Row gutter={[32, 32]} justify="space-between">
            {/* Services */}
            <Col xs={24} lg={16}>
              <h2 className="section-title text-left">บริการของเรา</h2>
              
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={12} lg={12}>
                  <div className="service-card slide-up">
                    <div className="service-icon">
                      <CheckSquareOutlined />
                    </div>
                    <h3 className="service-title">ตรวจสอบโฉนดที่ดิน</h3>
                    <p className="service-description">
                      ตรวจสอบความถูกต้องของเอกสารโฉนดที่ดินด้วยระบบออนไลน์
                    </p>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={12} lg={12}>
                  <div className="service-card slide-up">
                    <div className="service-icon">
                      <SafetyCertificateOutlined />
                    </div>
                    <h3 className="service-title">ยืนยันด้วย Blockchain</h3>
                    <p className="service-description">
                      เทคโนโลยี Blockchain รับประกันความปลอดภัยและโปร่งใส
                    </p>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={12} lg={12}>
                  <Link to="/user/dashboard">
                    <div className="service-card interactive slide-up">
                      <div className="service-icon">
                        <CopyOutlined />
                      </div>
                      <h3 className="service-title">คัดเอกสารออนไลน์</h3>
                      <p className="service-description">
                        ยื่นคำขอคัดเอกสารสำคัญต่าง ๆ ผ่านระบบออนไลน์
                      </p>
                    </div>
                  </Link>
                </Col>
                
                <Col xs={24} sm={12} md={12} lg={12}>
                  <div className="service-card slide-up">
                    <div className="service-icon">
                      <AuditOutlined />
                    </div>
                    <h3 className="service-title">ลงทะเบียนโฉนดที่ดิน</h3>
                    <p className="service-description">
                      ลงทะเบียนโฉนดที่ดินใหม่หรือโอนกรรมสิทธิ์
                    </p>
                  </div>
                </Col>
              </Row>
            </Col>

            {/* PR Section */}
            <Col xs={24} lg={7}>
              <h2 className="section-title text-left">ประชาสัมพันธ์</h2>
              <div className="pr-section slide-up">
                <h3 className="pr-title">ข่าวสารและประกาศ</h3>
                <div className="pr-item">
                  <h4 className="pr-item-title">ระบบใหม่เปิดให้บริการแล้ว</h4>
                  <p className="pr-item-content">
                    ระบบจัดการที่ดินด้วยเทคโนโลยี Blockchain พร้อมให้บริการแล้ววันนี้
                  </p>
                </div>
                <div className="pr-item">
                  <h4 className="pr-item-title">ข้อมูลการใช้งาน</h4>
                  <p className="pr-item-content">
                    คู่มือการใช้งานระบบและขั้นตอนต่าง ๆ สำหรับผู้ใช้งานใหม่
                  </p>
                </div>
                <div className="pr-item">
                  <h4 className="pr-item-title">ติดต่อสอบถาม</h4>
                  <p className="pr-item-content">
                    หากมีข้อสงสัยเพิ่มเติม สามารถติดต่อได้ที่ Call Center 1234
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="steps-container">
          <h2 className="steps-title">ขั้นตอนการลงทะเบียนโฉนดที่ดิน</h2>
          
          <div className="steps-wrapper slide-up">
            <Steps 
              className="custom-steps" 
              current={-1} 
              direction="horizontal"
              responsive={false}
            >
              <Step 
                title="กรอกข้อมูลและเลือกวันลงทะเบียน" 
                description="เตรียมเอกสารและกรอกข้อมูลในระบบ"
              />
              <Step 
                title="ยืนยันข้อมูลที่กรมที่ดิน" 
                description="นำเอกสารมายืนยันที่หน่วยงาน"
              />
              <Step 
                title="ใช้งานโฉนดอิเล็กทรอนิกส์" 
                description="รับโฉนดในรูปแบบดิจิทัลพร้อมใช้งาน"
              />
            </Steps>
          </div>
        </div>
      </section>

      {loading && (
        <div className="loading-overlay">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default MainPage;
