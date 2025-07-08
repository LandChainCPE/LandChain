import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Select, Typography } from "antd";
import React, { type JSX } from "react";
import "./MainPage.css";
import Logo from "../../assets/LogoLandchain.png";
const { Title, Text } = Typography;
const { Option } = Select;

const MainPage = (): JSX.Element => {
  return (
    <div className="main-container">
      <div className="bg-[#364049] w-full relative">
        {/* Header */}
        <Row justify="space-between" align="middle" className="bg-[#424f5e]" style={{ padding: "10px 30px" }}>
          <Col>
            <img src={Logo} alt="LandChain Logo" style={{ height: "120px" }} />
          </Col>
          <Col style={{ textAlign: "right" }}>
            <Button type="link" style={{ color: "white", fontSize: "25px", fontFamily: 'Kanit'}}>
              หน้าแรก
            </Button>
            <Button type="link" style={{ color: "white", fontSize: "25px", fontFamily: 'Kanit'}}>
              ลงทะเบียนโฉนดที่ดิน
            </Button>
            <Button type="link" style={{ color: "white", fontSize: "25px", fontFamily: 'Kanit'}}>
              ข่าวสาร
            </Button>
            <Button type="link" style={{ color: "white", fontSize: "25px", fontFamily: 'Kanit'}}>
              เข้าสู่ระบบ
            </Button>
          </Col>
        </Row>

        {/* Title Section */}
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Title level={1} style={{ color: "white" }}>
              บริการกรมที่ดินออนไลน์
            </Title>
            <Text style={{ color: "white", fontSize: "18px" }}>
              ตรวจสอบเอกสารสิทธิ์, นัดหมายส่งมอบที่ดิน ได้ในที่เดียว
            </Text>
          </Col>
        </Row>

        {/* Search Section */}
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col span={12}>
            <Input
              placeholder="ค้นหาเลขโฉนด/ เลขที่ดิน"
              size="large"
              prefix={<SearchOutlined />}
              style={{ width: "100%" }}
            />
          </Col>
          <Col>
            <Button type="primary" size="large" style={{ marginLeft: "10px" }}>
              ค้นหา
            </Button>
          </Col>
        </Row>

        {/* Filter Section */}
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col span={4}>
            <Select defaultValue="จังหวัด" size="large" style={{ width: "100%" }}>
              <Option value="จังหวัด">จังหวัด</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select defaultValue="ตร.ว" size="large" style={{ width: "100%" }}>
              <Option value="ตร.ว">ตร.ว</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select defaultValue="ตร.ว" size="large" style={{ width: "100%" }}>
              <Option value="ตร.ว">ตร.ว</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select defaultValue="ต่ำสุด" size="large" style={{ width: "100%" }}>
              <Option value="ต่ำสุด">ต่ำสุด</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select defaultValue="สูงสุด" size="large" style={{ width: "100%" }}>
              <Option value="สูงสุด">สูงสุด</Option>
            </Select>
          </Col>
          <Col>
            <Button type="primary" size="large">
              ค้นหา
            </Button>
          </Col>
        </Row>

        {/* Services Section */}
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Title level={2} style={{ color: "white" }}>
              บริการของเรา
            </Title>
          </Col>
        </Row>

        <Row justify="center" gutter={[16, 16]} style={{ marginTop: "20px" }}>
          <Col span={6}>
            <Card>
              <Title level={3}>ตรวจสอบโฉนดที่ดิน</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Title level={3}>ยืนยันความถูกต้องด้วย Block Chain</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Title level={3}>ทำเรื่องขอเอกสารออนไลน์</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Title level={3}>ลงทะเบียนโฉนดที่ดิน</Title>
            </Card>
          </Col>
        </Row>

        {/* Steps Section */}
        <Card style={{ marginTop: "40px", backgroundColor: "#424f5e" }}>
          <Title level={2} style={{ color: "white" }}>
            ขั้นตอนการลงทะเบียนโฉนดที่ดิน
          </Title>
        </Card>
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Title level={2} style={{ color: "white" }}>
              ขั้นตอนการลงทะเบียนโฉนดที่ดิน
            </Title>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col span={4}>
            <Card>
              <Title level={1}>1</Title>
              <Text>กรอกข้อมูล เลือกวันลงทะเบียน</Text>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Title level={1}>2</Title>
              <Text>ยืนยันข้อมูลที่กรมที่ดิน</Text>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Title level={1}>3</Title>
              <Text>ใช้งานโฉนดที่ดิน แบบอิเล็กทรอนิกส์</Text>
            </Card>
          </Col>
        </Row>

        {/* Property Listings Section */}
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Title level={2} style={{ color: "white" }}>
              ประกาศขายที่ดิน
            </Title>
          </Col>
        </Row>

        <Row justify="center" gutter={[16, 16]} style={{ marginTop: "20px" }}>
          <Col span={12}>
            <Card>
              <Title level={3}>นนทบุรี</Title>
              <Text>
                ขายที่ดิน ติดแม่น้ำพระยาสุธา นนทบุรี 2-3-43 ไร่...
              </Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Title level={3}>นครราชสีมา</Title>
              <Text>
                ขายที่ดินติดทางน้ำพร้อมที่ดิน...
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Public Relations Section */}
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Title level={2} style={{ color: "white" }}>
              ประชาสัมพันธ์
            </Title>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col span={12}>
            <Card />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MainPage;
