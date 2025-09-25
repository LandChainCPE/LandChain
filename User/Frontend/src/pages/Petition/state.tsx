import React, { useEffect, useState } from "react";
import { Layout, Table, Tag, Card, Row, Col, Statistic, Empty } from "antd";
import { FileTextOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { GetPetitionsByUserID } from "../../service/https/jib/jib";
import { GetInfoUserByWalletID } from "../../service/https/bam/bam";

const { Header, Content } = Layout;

interface State {
  id: number;
  name: string;
  color: string;
}

interface Petition {
  ID: number;
  first_name: string;
  last_name: string;
  topic: string;
  date: string;
  description: string;
  State: State;
}

const StateComponent: React.FC = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>(petitions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        setLoading(true);
        // พยายามดึง user_id จาก sessionStorage ก่อน
        let userId = sessionStorage.getItem("user_id");
        // ถ้าไม่มี user_id ใน sessionStorage ให้ลองดึงจาก user info API (เช่นเดียวกับหน้า Petition)
        if (!userId) {
          try {
            const userInfo = await GetInfoUserByWalletID();
            userId = userInfo?.user_id || userInfo?.id;
          } catch (e) {
            userId = null;
          }
        }
        if (!userId) {
          setPetitions([]);
          setFilteredPetitions([]);
          setLoading(false);
          return;
        }
        const response = await GetPetitionsByUserID(userId);
        setPetitions(response);
        setFilteredPetitions(response);
      } catch (error) {
        console.error("Error fetching petition data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetitions();
  }, []);

  const getStatusIcon = (state: State) => {
    if (!state) return <ClockCircleOutlined />; // Handle the case where state is undefined

    switch (state.name) {
      case "รอตรวจสอบ":
        return <ClockCircleOutlined />;
      case "เสร็จสิ้น":
        return <CheckCircleOutlined />;
      case "กำลังดำเนินการ":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatistics = () => {
    const total = petitions.length;

    // Check for undefined state and ensure safety before accessing state.name
    const pending = petitions.filter(p => p.State?.name === "รอตรวจสอบ").length;
    const approved = petitions.filter(p => p.State?.name === "อนุมัติแล้ว").length;
    const processing = petitions.filter(p => p.State?.name === "กำลังดำเนินการ").length;

    return { total, pending, approved, processing };
  };

  const stats = getStatistics();

  const petitionColumns = [
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
    <Layout style={{ minHeight: "100vh", background: "#f5faf7ff" }}>

      <Layout>
        <Header style={{
          background: "linear-gradient(135deg, #2b423a 0%, #1f3b33 100%)",
          padding: "48px 0 36px 0",
          borderRadius: "0 0 2.5rem 2.5rem",
          boxShadow: "0 8px 32px rgba(23, 46, 37, 0.10)",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* Glass overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
            zIndex: 1
          }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            <h1 style={{
              margin: 0,
              background: "linear-gradient(135deg, #fff 0%, #d0e2e6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 1,
              textShadow: "0 2px 8px rgba(23,46,37,0.10)"
            }}>
              ติดตามสถานะคำร้อง
            </h1>
            <div style={{ color: "#fff", opacity: 0.85, fontSize: 16, fontWeight: 400, marginTop: 8 }}>
              ตรวจสอบสถานะและประวัติการยื่นคำร้องของคุณ
            </div>
          </div>
        </Header>

        <Content style={{ padding: "32px", background: "#f5f7fa" }}>
          {/* Statistics Section */}
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
                  title="เสร็จสิ้น"
                  value={stats.approved}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Petition Table */}
          <div style={{ margin: '24px 0', fontSize: '1.5rem', fontWeight: 600, color: '#4b5563', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>
            คำร้องขอดูเอกสาร
          </div>
          <Card style={{ borderRadius: 12, overflow: "hidden" }}>
            <Table
              columns={petitionColumns}
              dataSource={filteredPetitions}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
              }}
              locale={{
                emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ไม่พบข้อมูลคำร้อง" />,
              }}
            />
          </Card>
        </Content>
      </Layout>
      {/* หมายเหตุ: เมื่อสถานะเสร็จสิ้น ให้ไปจองคิว */}
      <div
        style={{
          margin: "32px auto 0 auto",
          maxWidth: 650,
          background: "linear-gradient(90deg, #fffbe6 0%, #e6fffb 100%)",
          border: "1.5px solid #ffe58f",
          borderRadius: 16,
          padding: "20px 28px",
          color: "#ad6800",
          fontWeight: 600,
          fontSize: 18,
          boxShadow: "0 2px 12px rgba(255, 215, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 24 }} />
        <span>
          <span style={{ color: "#fa8c16", fontWeight: 700 }}>หมายเหตุ:</span> เมื่อสถานะ <span style={{ color: "#52c41a", fontWeight: 700 }}>เสร็จสิ้น</span> กรุณาไปจองคิวเพื่อนัดหมายต่อไป
        </span>
      </div>
    </Layout>
  );
};

export default StateComponent;