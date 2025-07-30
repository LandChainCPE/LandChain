import React, { useEffect, useState } from "react";
import { Layout, Menu, Table, Tag, Card, Typography, Row, Col, Statistic, Avatar, Empty } from "antd";
import { HomeOutlined, ProfileOutlined, FileTextOutlined, CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import { GetAllPetition } from "../../service/https/petition";  
import { useNavigate } from "react-router-dom";  

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface State {
  id: number;
  name: string;
  color: string;
}

interface Petition {
  id: number;
  first_name: string;
  last_name: string;
  topic: string;
  date: string;
  description: string;
  ID: number;
  State: State;
}

const StateComponent: React.FC = () => {
  const navigate = useNavigate();   
  const [petitions, setPetitions] = useState<Petition[]>([]);  
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>(petitions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {     
    const fetchPetitions = async () => {       
      try {         
        const response = await GetAllPetition(); // ดึงข้อมูลคำร้องจาก API       
        setPetitions(response); // เก็บข้อมูลที่ได้ใน petitions
        setFilteredPetitions(response); // เก็บข้อมูลที่กรองแล้วใน filteredPetitions
      } catch (error) {        
        console.error("Error fetching petition data:", error);      
      } finally {
        setLoading(false);
      }    };      
    fetchPetitions();   
  }, []);

  const getStatusIcon = (state: State) => {
    switch (state.name) {
      case "รอตรวจสอบ":
        return <ClockCircleOutlined />;
      case "อนุมัติแล้ว":
        return <CheckCircleOutlined />;
      case "กำลังดำเนินการ":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatistics = () => {
    const total = petitions.length;
    const pending = petitions.filter(p => p.State.name === "รอตรวจสอบ").length;
    const approved = petitions.filter(p => p.State.name === "อนุมัติแล้ว").length;
    const processing = petitions.filter(p => p.State.name === "กำลังดำเนินการ").length;

    return { total, pending, approved, processing };
  };

  const stats = getStatistics();

  const columns = [
    {
      title: "เลขคำร้อง",
      dataIndex: "ID",
      key: "ID",
      width: 120,
      render: (id: number) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          #{id}
        </Tag>
      ),
    },
    {
      title: "ชื่อ",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "นามสกุล",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "เรื่อง",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "วันที่ยื่น",
      dataIndex: "date",
      key: "date",
      width: 130,
      render: (date: string) => {
        const formattedDate = date
          ? new Date(date).toLocaleDateString('th-TH', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : "ไม่ระบุวันที่";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarOutlined style={{ color: "#8c8c8c" }} />
            <span>{formattedDate}</span>
          </div>
        );
      },
    },
    {
      title: "สถานะ",
      key: "status",
      width: 150,
      render: (record: Petition) => {
        const state = record.State;
        const color = state ? state.color : 'gray';
        const statusName = state ? state.name : 'ไม่ระบุสถานะ';
        return (
          <Tag 
            color={color} 
            icon={getStatusIcon(state)}
            style={{ 
              borderRadius: 16,
              padding: "4px 12px",
              fontWeight: 600
            }}
          >
            {statusName}
          </Tag>
        );
      },
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
          defaultSelectedKeys={["2"]}
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
            style={{ borderRadius: "0 25px 25px 0",margin: "4px 0",marginRight: 12,height: 48,display: "flex",alignItems: "center"}}>
              ติดตามสถานะคำร้อง
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{background: "#fff",padding: "40px",display: "flex",justifyContent: "space-between",alignItems: "center",boxShadow: "0 2px 8px rgba(0,0,0,0.06)",borderBottom: "none"}}>              
          <div>
            <h1 style={{ margin: 0, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",WebkitBackgroundClip: "text",WebkitTextFillColor: "transparent",fontSize: 24, fontWeight: 700}}>
               📋 ติดตามสถานะคำร้อง
            </h1>
          </div>
        </Header>

        <Content style={{ padding: "32px", background: "#f5f7fa" }}>
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12, textAlign: "center" }}>
                <Statistic
                  title="คำร้องทั้งหมด"
                  value={stats.total}
                  prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff", fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12, textAlign: "center" }}>
                <Statistic
                  title="รอตรวจสอบ"
                  value={stats.pending}
                  prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
                  valueStyle={{ color: "#fa8c16", fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12, textAlign: "center" }}>
                <Statistic
                  title="กำลังดำเนินการ"
                  value={stats.processing}
                  prefix={<ExclamationCircleOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff", fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12, textAlign: "center" }}>
                <Statistic
                  title="อนุมัติแล้ว"
                  value={stats.approved}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ borderRadius: 12, overflow: "hidden" }}>
            <Table
              columns={columns}
              dataSource={filteredPetitions}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} จาก ${total} รายการ`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="ไม่พบข้อมูลคำร้อง"
                  />
                )
              }}
              style={{ 
                background: "#fff",
              }}
              rowClassName={(record, index) => 
                index % 2 === 0 ? "" : "table-row-light"
              }
            />
          </Card>

          {/* Help Section */}
          <Card style={{ 
            marginTop: 24,
            background: "linear-gradient(135deg, #e6f7ff 0%, #f6ffed 100%)",
            border: "1px solid #d9f7be",
            borderRadius: 12
          }}>
            <Row gutter={24} align="middle">
              <Col flex="auto">
                <Title level={4} style={{ margin: 0, color: "#389e0d" }}>
                  💡 คำแนะนำ
                </Title>
                <Text style={{ color: "#666" }}>
                  • คลิก "ดูรายละเอียด" เพื่อดูข้อมูลเพิ่มเติม<br/>
                  • สถานะจะอัพเดทอัตโนมัติเมื่อมีการเปลี่ยนแปลง<br/>
                  • หากมีปัญหาโปรดติดต่อเจ้าหน้าที่
                </Text>
              </Col>
              <Col>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StateComponent;
