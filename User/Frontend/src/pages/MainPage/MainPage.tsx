import { CheckSquareOutlined, CopyOutlined, EnvironmentOutlined, SearchOutlined, AuditOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Select, Typography, Form, Tag, Pagination } from "antd";
import "./MainPage.css";
import Logo from "../../assets/LogoLandchain.png";
import Landpic from "../../assets/LandPic.jpg";
import LandpicKorat from "../../assets/LandPicKorat.jpg"
import type { JSX } from "react";
const { Title, Text } = Typography;
const { Option } = Select;

const MainPage = (): JSX.Element => {
  return (
    <div className="main-container">
      <div className="bg-[#364049] w-full relative">
        {/* Header */}
        <Row justify="space-between" align="middle" className="bg-[#424f5e]" style={{ padding: "10px 30px" }}>
          <Col>
            <img src={Logo} alt="LandChain Logo" style={{ width: "100%",height: "auto",maxWidth: "200px" }} />
          </Col>
          <Col style={{ textAlign: "right" }}>
            <Button type="link" style={{ color: "white", fontSize: "22px", fontFamily: 'Kanit'}}>
              หน้าแรก
            </Button>
            <Button type="link" style={{ color: "white", fontSize: "22px", fontFamily: 'Kanit'}}>
              ลงทะเบียนโฉนดที่ดิน
            </Button>
            <Button type="link" style={{ color: "white", fontSize: "22px", fontFamily: 'Kanit'}}>
              ข่าวสาร
            </Button>
            <Button type="link" style={{ color: "white", fontSize: "22px", fontFamily: 'Kanit'}}>
              เข้าสู่ระบบ
            </Button>
          </Col>
        </Row>

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
              <Title level={4}><EnvironmentOutlined /> ขายที่ดิน นนทบุรี</Title>
              <Text type="secondary">2-3-43 ไร่ • ติดแม่น้ำเจ้าพระยา</Text>
              <br />
              <Tag color="blue">ติดน้ำ</Tag>
              <br />
              <Text strong>ราคา: 18 ล้านบาท</Text>
              <p style={{ marginTop: 8, color: '#555' }}>
                ที่ดินเหมาะสำหรับทำบ้านพักตากอากาศ เงียบสงบ บรรยากาศดี
              </p> 
              <Button type="link">ดูรายละเอียด</Button>
            </Card>

          </Col>
          <Col span={10}>
            <Card
              hoverable
              cover={<img alt="LandpicKorat" src={LandpicKorat} style={{ height: 200, objectFit: 'cover' }} />}
              style={{ fontFamily: 'Kanit', borderRadius: '12px' }}
            >
              <Title level={4}> <EnvironmentOutlined /> ขายที่ดิน นครราชสีมา</Title>
              <Text type="secondary">5-3-16 ไร่ • ติดถนนใหญ่</Text>
               <br />
              <Tag color="green">ติดถนน</Tag>
              <br />
              <Text strong>ราคา: 35 ล้านบาท</Text>
              <p style={{ marginTop: 8, color: '#555' }}>
                ที่ดินเหมาะสำหรับทำบ้านที่อยู่อาศัย เดินทางสะดวก ใกล้ตลาดและโรงเรียน
              </p> 
              <Button type="link">ดูรายละเอียด</Button>
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

        {/* Services Section */}
        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={15} >
            <Title level={2} style={{ color: "white", fontFamily: 'Kanit' }}>
              บริการของเรา
            </Title>
          </Col>
        </Row>

        <Row justify="start" gutter={[16, 16]} style={{ marginTop: "20px" }}>
          <Col span={5} offset={1}>
            <Card  style={{ height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{ display: 'flex', justifyContent: 'center'}}>
                <CheckSquareOutlined style={{ fontSize: '70px'}} />
              </div>
              <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ตรวจสอบโฉนดที่ดิน</Title>
            </Card>
          </Col>
          <Col span={5}>
            <Card style={{ height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SafetyCertificateOutlined style={{ fontSize: '70px'}} />
              </div>
              <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ยืนยันความถูกต้องด้วย Block Chain</Title>
            </Card>
          </Col>
        </Row>
        <Row justify="start" gutter={[16, 16]} style={{ marginTop: "20px" }}>
          <Col span={5} offset={1}>
            <Card style={{ height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CopyOutlined style={{ fontSize: '70px'}} /> 
              </div>
              <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ทำเรื่องขอคัดเอกสารออนไลน์</Title>
            </Card>
          </Col>
          <Col span={5}>
            <Card style={{ height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <AuditOutlined style={{ fontSize: '70px'}} />
              </div>
              <Title level={3} style={{ fontFamily: 'Kanit', textAlign: 'center' }}>ลงทะเบียนโฉนดที่ดิน</Title>
            </Card>
          </Col>
        </Row>

        {/* Steps Section */}
        <Col xs={24} sm={24} md={24} lg={24}>
          <Card style={{ marginTop: "40px", backgroundColor: "#424f5e", border: "none", width: "100%"}}>
            <Title level={2} style={{ color: "white", fontFamily: 'Kanit', textAlign: "center" }}>
              ขั้นตอนการลงทะเบียนโฉนดที่ดิน
            </Title>
            <Row justify="center" gutter={[20, 16]} style={{ marginTop: "50px" }}>
              <Col span={4}>
                <Card>
                  <Title level={1}>1</Title>
                  <Text style={{ fontFamily: 'Kanit' }}>กรอกข้อมูล เลือกวันลงทะเบียน</Text>
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Title level={1}>2</Title>
                  <Text style={{ fontFamily: 'Kanit' }}>ยืนยันข้อมูลที่กรมที่ดิน</Text>
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Title level={1}>3</Title>
                  <Text style={{ fontFamily: 'Kanit' }}>ใช้งานโฉนดที่ดิน แบบอิเล็กทรอนิกส์</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Row justify="center" style={{ marginTop: "40px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Title level={2} style={{ color: "white", fontFamily: 'Kanit' }}>
              ขั้นตอนการลงทะเบียนโฉนดที่ดิน
            </Title>
          </Col>
        </Row>

        <Row justify="center" gutter={[20, 16]} style={{ marginTop: "20px" }}>
          <Col span={4}>
            <Card>
              <Title level={1}>1</Title>
              <Text style={{ fontFamily: 'Kanit' }}>กรอกข้อมูล เลือกวันลงทะเบียน</Text>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Title level={1}>2</Title>
              <Text style={{ fontFamily: 'Kanit' }}>ยืนยันข้อมูลที่กรมที่ดิน</Text>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Title level={1}>3</Title>
              <Text style={{ fontFamily: 'Kanit' }}>ใช้งานโฉนดที่ดิน แบบอิเล็กทรอนิกส์</Text>
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
