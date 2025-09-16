import { CheckSquareOutlined, CopyOutlined, EnvironmentOutlined, SearchOutlined, AuditOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Select, Typography, Form, Tag, Pagination, Steps } from "antd";
import Loader from "../../component/third-patry/Loader";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import { useState } from "react";
import Logo from "../../assets/LogoLandchain.png";
import Landpic from "../../assets/LandPic.jpg";
import LandpicKorat from "../../assets/LandPicKorat.jpg"
import type { JSX } from "react";
import { Link } from 'react-router-dom';
import Header from "./HeaderUserMain";
import Navbar from "../../component/user/Navbar";

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const MainPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="main-container">
      <div className="bg-[#364049] w-full relative">
        {/* Header */}
        <Navbar />

        {/* Title Section */}
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Title level={1} style={{ color: "white", fontFamily: 'Kanit' }}>
              บริการกรมที่ดินออนไลน์
            </Title>
            <Text style={{ color: "white", fontSize: "18px", fontFamily: 'Kanit' }}>
              ตรวจสอบเอกสารสิทธิ์, นัดหมายส่งมอบที่ดิน ได้ในที่เดียว
            </Text>
          </Col>
        </Row>

        {/* Search Section */}
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col span={12}>
            <Input
              style={{ width: "100%", fontFamily: 'Kanit, sans-serif !important' }}
              placeholder="ค้นหาเลขโฉนด/ เลขที่ดิน"
              size="large"
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Button type="primary" size="large" style={{ marginLeft: "10px", fontFamily: 'Kanit' }}>
              ค้นหา
            </Button>
          </Col>
        </Row>

        {/* Filter Section */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Form layout="vertical">
            <Row justify="center" gutter={[10, 16]} style={{ marginTop: "30px" }}>
              <Col span={4}>
                <Form.Item label=" " colon={false} style={{ color: "white", fontFamily: 'Kanit' }}>
                  <Select defaultValue="จังหวัด" size="large" style={{ width: "100%", fontFamily: 'Kanit' }}>
                    <Option value="จังหวัด" style={{ fontFamily: 'Kanit' }}>จังหวัด</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label={<span className="custom-label">ค้นหาตามขนาด</span>} colon={false} style={{ marginBottom: 0}} >
                  <Input.Group compact>
                    <Input
                      type="text"
                      style={{ width: '60%', fontFamily: 'Kanit' }}
                      placeholder="กรอกขนาด"
                      size="large"
                    />
                    <Select defaultValue="ตร.ว" size="large" style={{ width: '40%', fontFamily: 'Kanit' }}>
                      <Option value="ตร.ว" style={{ fontFamily: 'Kanit' }}>ตร.ว</Option>
                      <Option value="ไร่" style={{ fontFamily: 'Kanit' }}>ไร่</Option>
                      <Option value="งาน" style={{ fontFamily: 'Kanit' }}>งาน</Option>
                    </Select>
                  </Input.Group>
                </Form.Item>
              </Col>

              <Col>
                <Form.Item label=" " colon={false} style={{ marginBottom: 0,color: "white", fontFamily: 'Kanit' }}>
                  <span style={{ fontFamily: 'Kanit', fontSize: '20px' }}>ถึง</span>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>
                  <Input.Group compact>
                    <Input
                      type="text"
                      style={{ width: '60%', fontFamily: 'Kanit' }}
                      placeholder="กรอกขนาด"
                      size="large"
                    />
                    <Select defaultValue="ตร.ว" size="large" style={{ width: '40%', fontFamily: 'Kanit' }}>
                      <Option value="ตร.ว" style={{ fontFamily: 'Kanit' }}>ตร.ว</Option>
                      <Option value="ไร่" style={{ fontFamily: 'Kanit' }}>ไร่</Option>
                      <Option value="งาน" style={{ fontFamily: 'Kanit' }}>งาน</Option>
                    </Select>
                  </Input.Group>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label={<span className="custom-label">ราคาระหว่าง</span>} colon={false} style={{ marginBottom: 0 }}>
                  <Input
                      type="text"
                      style={{ width: '100%', fontFamily: 'Kanit' }}
                      placeholder="ต่ำสุด"
                      size="large"/>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label=" " colon={false} style={{ marginBottom: 0}}>
                  <Input
                      type="text"
                      style={{ width: '100%', fontFamily: 'Kanit', marginRight: 'px' }}
                      placeholder="สูงสุด"
                      size="large"/>
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item label=" " style={{ marginBottom: 0 }}>
                  <Button type="primary" size="large" style={{ fontFamily: 'Kanit', marginRight: '10px' }}>
                    ค้นหา
                  </Button>
                </Form.Item>
              </Col>

            </Row>
          </Form>
        </div>

        {/* Property Listings Section */}
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={19} style={{ textAlign: "left" }}>
            <Title level={2} style={{ color: "white", fontFamily: 'Kanit' }}>
              ประกาศขายที่ดิน
            </Title>
          </Col>
        </Row>
        <Row justify="center" gutter={[16, 16]} style={{ marginTop: "20px" }}>
          <Col span={10}>
            <Card
              hoverable
              cover={<img alt="Landpic" src={Landpic} style={{ height: 200, objectFit: 'cover' }} />}
              style={{ fontFamily: 'Kanit', borderRadius: '12px' }}
            >
              <Title level={4} style={{ fontFamily: 'Kanit'  }}><EnvironmentOutlined /> ขายที่ดิน นนทบุรี</Title>
              <Text type="secondary" style={{ fontFamily: 'Kanit'  }}>2-3-43 ไร่ • ติดแม่น้ำเจ้าพระยา</Text>
              <br />
              <Tag color="blue" style={{ fontFamily: 'Kanit'  }}>ติดน้ำ</Tag>
              <br />
              <Text strong style={{ fontFamily: 'Kanit'  }}>ราคา: 18 ล้านบาท</Text>
              <p style={{ marginTop: 8, color: '#555' }}>
                ที่ดินเหมาะสำหรับทำบ้านพักตากอากาศ เงียบสงบ บรรยากาศดี
              </p> 
              <Button type="link" style={{ fontFamily: 'Kanit'  }}>ดูรายละเอียด</Button>
            </Card>

          </Col>
          <Col span={10}>
            <Card
              hoverable
              cover={<img alt="LandpicKorat" src={LandpicKorat} style={{ height: 200, objectFit: 'cover' }} />}
              style={{ fontFamily: 'Kanit', borderRadius: '12px' }}
            >
              <Title level={4} style={{ fontFamily: 'Kanit'  }}> <EnvironmentOutlined /> ขายที่ดิน นครราชสีมา</Title>
              <Text type="secondary" style={{ fontFamily: 'Kanit'  }}>5-3-16 ไร่ • ติดถนนใหญ่</Text>
               <br />
              <Tag color="green" style={{ fontFamily: 'Kanit'  }}>ติดถนน</Tag>
              <br />
              <Text strong style={{ fontFamily: 'Kanit'  }}>ราคา: 35 ล้านบาท</Text>
              <p style={{ marginTop: 8, color: '#555' }}>
                ที่ดินเหมาะสำหรับทำบ้านที่อยู่อาศัย เดินทางสะดวก ใกล้ตลาดและโรงเรียน
              </p> 
              <Button type="link" style={{ fontFamily: 'Kanit'  }}>ดูรายละเอียด</Button>
            </Card>
          </Col>
        </Row>
        <br />
        <Pagination align="center" defaultCurrent={1} total={50} />
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

        {/* Services + Public Relations Section */}
        <Row justify="space-between" align="top" style={{ marginTop: "40px", padding: '0 5%' }}>
          {/* Col ซ้าย: บริการของเรา + การ์ดบริการ */}
          <Col span={16}>
            <Title level={2} style={{ color: "white", fontFamily: 'Kanit' }}>
              บริการของเรา
            </Title>

            <Row justify="start" gutter={[16, 16]} style={{ marginTop: "20px" }}>
              <Col span={11}>
                <Card style={{ height: 250, display: 'flex',  justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CheckSquareOutlined style={{ fontSize: '70px' }} />
                  </div>
                  <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ตรวจสอบโฉนดที่ดิน</Title>
                </Card>
              </Col>
              <Col span={11}>
                <Card style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <SafetyCertificateOutlined style={{ fontSize: '70px' }} />
                  </div>
                  <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ยืนยันความถูกต้องด้วย Block Chain</Title>
                </Card>
              </Col>
            </Row>

            <Row justify="start" gutter={[16, 16]} style={{ marginTop: "20px" }}>
              <Col span={11}>
              <Link to="/user/dashboard"> 
                <Card style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CopyOutlined style={{ fontSize: '70px' }} />
                  </div>
                  <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ทำเรื่องขอคัดเอกสารออนไลน์</Title>
                </Card>
              </Link>

              </Col>
              <Col span={11}>
                <Card style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <AuditOutlined style={{ fontSize: '70px' }} />
                  </div>
                  <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ลงทะเบียนโฉนดที่ดิน</Title>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Col ขวา: ประชาสัมพันธ์ */}
          <Col span={7}>
            <Title level={2} style={{ color: "white", fontFamily: 'Kanit'}}>
              ประชาสัมพันธ์
            </Title>
            <Card style={{ height: 550, marginTop: "20px" }}>
              <p style={{ fontFamily: 'Kanit' }}>ใส่ข้อความประชาสัมพันธ์ เช่น ข่าวล่าสุด หรือประกาศสำคัญ</p>
            </Card>
          </Col>
        </Row>


        {/* Steps Section */}
        <Col xs={24} sm={24} md={24} lg={24} style={{ marginTop: "200px" }}>
            <Title level={2} style={{ color: "white", fontFamily: 'Kanit', textAlign: "center" }}>
              ขั้นตอนการลงทะเบียนโฉนดที่ดิน
            </Title>
            <Row justify="center" style={{ marginTop: "80px" }}>
              <Col span={13} >
                <Steps current={-1} labelPlacement="vertical">
                  <Step title="กรอกข้อมูลเลือกวันลงทะเบียน" />
                  <Step title="ยืนยันข้อมูลที่กรมที่ดิน" />
                  <Step title="ใช้งานโฉนดที่ดินแบบอิเล็กทรอนิกส์" />
                </Steps>
              </Col>
            </Row>
        </Col>
        {loading && <div className="mt-3"><Loader /></div>}
      </div>
    </div>
  );
};

export default MainPage;
