import React from "react";
import { Layout, Menu, Card, Row, Col, Button, Badge, Avatar } from "antd";
import { HomeOutlined, ProfileOutlined, FileTextOutlined,BlockOutlined,RightOutlined,UserOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();  

  const categories = [
    {
      title: "เอกสารและตรวจสอบ",
      description: "ขอคัดสำเนาโฉนดที่ดิน / เอกสารต่างๆ",
      route: "/user/petition",
      icon: <FileTextOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      count: "12"
    },
    {
      title: "โฉนดที่ดิน",
      description: "ขอดูข้อมูลใน Blockchain",
      route: "/transfer",
      icon: <BlockOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      count: "8"
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Sider 
        width={260} 
        style={{ 
          background: "linear-gradient(180deg, #001529 0%, #002140 100%)",
          boxShadow: "4px 0 20px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{
          padding: "24px 16px",
          textAlign: "center",
          borderBottom: "1px solid #ffffff20"
        }}>
          <Avatar size={48} icon={<UserOutlined />} style={{ marginBottom: 12 }} />
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
            ระบบยื่นคำร้อง
          </div>
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ background: "transparent",border: "none",fontSize: 15,paddingTop: 16}}
          theme="dark"
        >
          <Menu.Item 
            key="1" 
            icon={<HomeOutlined />} 
            onClick={() => navigate("/user/dashboard")}
            style={{ borderRadius: "0 25px 25px 0",margin: "4px 0",marginRight: 12,height: 48,display: "flex",alignItems: "center"}}>
              หน้าหลัก
          </Menu.Item>
          <Menu.Item 
            key="2" 
            icon={<ProfileOutlined />} 
            onClick={() => navigate("/user/state")}
            style={{borderRadius: "0 25px 25px 0",margin: "4px 0",marginRight: 12,height: 48,display: "flex",alignItems: "center"}}>
              ติดตามสถานะคำร้อง
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderBottom: "none"
          }}
        >
          <div>
            <h1 style={{ 
              margin: 0, 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 24,
              fontWeight: 700
            }}>
              ยื่นคำร้องออนไลน์
            </h1>
          </div>
        </Header>

        <Content style={{ padding: "25px", background: "#f5f7fa", marginTop: 24 }}> {/* Add marginTop */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: "#262626",
              marginBottom: 8
            }}>
              🏛️ บริการยื่นคำร้อง
            </h2>
            <p style={{ color: "#8c8c8c", margin: 0 }}>
              เลือกประเภทบริการที่คุณต้องการใช้งาน
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {categories.map((item, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: "none",
                    overflow: "hidden",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative"
                  }}
                  bodyStyle={{ 
                    padding: 0,
                    height: 280
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)";
                  }}
                >
                  <div
                    style={{
                      background: item.gradient,
                      height: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}
                  >
                    {item.icon}
                    <Badge 
                      count={item.count} 
                      style={{ 
                        position: "absolute",
                        top: 16,
                        right: 16,
                        backgroundColor: "#fff",
                        color: "#666",
                        fontWeight: 600
                      }}
                    />
                  </div>
                  
                  <div style={{ padding: 24 }}>
                    <h3 style={{ 
                      fontWeight: 700, 
                      marginBottom: 12,
                      fontSize: 18,
                      color: "#262626"
                    }}>
                      {item.title}
                    </h3>
                    <p style={{ 
                      color: "#8c8c8c", 
                      lineHeight: 1.6,
                      marginBottom: 20,
                      fontSize: 14
                    }}>
                      {item.description}
                    </p>
                    
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<RightOutlined />}
                      iconPosition="end"
                      style={{
                        background: "linear-gradient(135deg, #00994C 0%, #00b956 100%)",
                        border: "none",
                        borderRadius: 10,
                        height: 44,
                        fontWeight: 600,
                        fontSize: 15,
                        boxShadow: "0 4px 15px rgba(0, 153, 76, 0.3)"
                      }}
                      onClick={() => navigate(item.route)}
                    >
                      ยื่นคำร้อง
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
