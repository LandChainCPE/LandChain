import React, { useEffect, useMemo, useState } from "react";
import { Layout, Table, Tag, Card, Row, Col, Statistic, Empty, Select, message } from "antd";
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { GetAllPetition, UpdatePetitionState, GetAllStates } from "../service/https/jib/jib";

const { Content } = Layout;

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
  State: State | null;
}

const StatePetition: React.FC = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [peti, sts] = await Promise.all([GetAllPetition(), GetAllStates()]);
        setPetitions(peti);
        setFilteredPetitions(peti);
        setStates(sts);
      } catch (e) {
        console.error(e);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const stateById = useMemo(() => {
    const m = new Map<number, State>();
    states.forEach(s => m.set(s.id, s));
    return m;
  }, [states]);

  const getStatusIcon = (state?: State | null) => {
    const name = state?.name;
    switch (name) {
      case "รอตรวจสอบ":      return <ClockCircleOutlined />;
      case "อนุมัติแล้ว":     return <CheckCircleOutlined />;
      case "กำลังดำเนินการ":  return <ExclamationCircleOutlined />;
      default:                 return <ClockCircleOutlined />;
    }
  };

  const stats = useMemo(() => {
    const total = petitions.length;
    const pending = petitions.filter(p => p.State?.name === "รอตรวจสอบ").length;
    const approved = petitions.filter(p => p.State?.name === "อนุมัติแล้ว").length;
    const processing = petitions.filter(p => p.State?.name === "กำลังดำเนินการ").length;
    return { total, pending, approved, processing };
  }, [petitions]);

  const stateOptions = states.map(s => ({
    label: s.name,
    value: s.id,
    // แนบข้อมูลทั้ง object เผื่อใช้ตอนอัปเดต local state
    stateObj: s,
  }));

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
    { title: "ชื่อ", dataIndex: "first_name", key: "first_name" },
    { title: "นามสกุล", dataIndex: "last_name", key: "last_name" },
    { title: "เรื่อง", dataIndex: "topic", key: "topic" },
    { title: "รายละเอียด", dataIndex: "description", key: "description" },
    {
      title: "วันที่ยื่น",
      dataIndex: "date",
      key: "date",
      width: 130,
      render: (date: string) => {
        const formattedDate = date
          ? new Date(date).toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })
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
      width: 170,
      render: (record: Petition) => {
        const s = record.State;
        const color = s?.color || "default";
        const name = s?.name || "ไม่ระบุสถานะ";
        return (
          <Tag
            color={color}
            icon={getStatusIcon(s)}
            style={{ borderRadius: 16, padding: "4px 12px", fontWeight: 600 }}
          >
            {name}
          </Tag>
        );
      },
    },
    {
      title: "เปลี่ยนสถานะ",
      key: "action",
      render: (record: Petition) => (
        <Select
          style={{ width: 180 }}
          placeholder="เลือกสถานะ"
          // ใช้ id เป็นค่า
          value={record.State?.id}
          options={stateOptions}
          onChange={async (_value: number, option: any) => {
            try {
              const stateId = _value;
              await UpdatePetitionState(record.ID.toString(), stateId);
              message.success("อัปเดตสถานะสำเร็จ");

              // อัปเดตค่าในตารางทันที (ทั้ง id, name, color)
              const newState: State | undefined = option?.stateObj || stateById.get(stateId);
              setPetitions(prev =>
                prev.map(p =>
                  p.ID === record.ID ? { ...p, State: newState || null } : p
                )
              );
              setFilteredPetitions(prev =>
                prev.map(p =>
                  p.ID === record.ID ? { ...p, State: newState || null } : p
                )
              );
            } catch (err) {
              console.error(err);
              message.error("อัปเดตสถานะไม่สำเร็จ");
            }
          }}
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Content style={{ padding: "32px", background: "#f5f7fa" }}>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: "center" }}>
              <Statistic title="คำร้องทั้งหมด" value={stats.total}
                prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontWeight: 700 }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: "center" }}>
              <Statistic title="รอตรวจสอบ" value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{ color: "#fa8c16", fontWeight: 700 }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: "center" }}>
              <Statistic title="กำลังดำเนินการ" value={stats.processing}
                prefix={<ExclamationCircleOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontWeight: 700 }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: "center" }}>
              <Statistic title="อนุมัติแล้ว" value={stats.approved}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a", fontWeight: 700 }} />
            </Card>
          </Col>
        </Row>

        <div style={{ margin: "24px 0", fontSize: "1.5rem", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #1890ff", paddingBottom: 8 }}>
          คำร้องขอดูเอกสาร
        </div>

        <Card style={{ borderRadius: 12, overflow: "hidden" }}>
          <Table
            columns={petitionColumns}
            dataSource={filteredPetitions}
            // ✅ แก้ rowKey ให้ถูกต้อง
            rowKey="ID"
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
  );
};

export default StatePetition;
