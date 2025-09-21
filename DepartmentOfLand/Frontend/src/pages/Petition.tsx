import React, { useEffect, useMemo, useState } from "react";
import { Layout, Table, Tag, Card, Row, Col, Statistic, Empty, Select, message } from "antd";
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { GetAllPetition, UpdatePetitionStatus, GetAllStates } from "../service/https/jib/jib";

const { Content } = Layout;

type State = {
  ID: any;
  id: number;
  name: string;
  color?: string;
};
type Petition = {
  ID: number;
  first_name: string;
  last_name: string;
  topic: string;
  description: string;
  date: string;
  State?: State | null;
};


const StatePetition: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>([]);
  const [states, setStates] = useState<State[]>([]);

  // สร้าง options สำหรับ Select เปลี่ยนสถานะ
  const stateOptions = useMemo(() =>
    states.map(s => ({
      label: s.name,
      value: s.name,
      stateObj: s,
      key: s.ID,
      style: { color: s.color },
    })),
    [states]
  );

  // สร้าง Map สำหรับค้นหา State ตาม id
  // const stateById = useMemo(() => {
  //   const m = new Map<number, State>();
  //   states.forEach(s => m.set(s.id, s));
  //   return m;
  // }, [states]);

  // สถิติ
  const stats = useMemo(() => {
    let total = petitions.length;
    let pending = petitions.filter(p => p.State?.name === "รอตรวจสอบ").length;
    let processing = petitions.filter(p => p.State?.name === "กำลังดำเนินการ").length;
    // นับ "เสร็จสิ้น" (รองรับข้อมูลเก่า)
    let approved = petitions.filter(p => p.State?.name === "เสร็จสิ้น").length;
    return { total, pending, processing, approved };
  }, [petitions]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [peti, sts] = await Promise.all([GetAllPetition(), GetAllStates()]);
        console.log("Fetched sts:", sts);
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

  const getStatusIcon = (state?: State | null) => {
    const name = state?.name;
    switch (name) {
      case "รอตรวจสอบ":      return <ClockCircleOutlined />;
      case "เสร็จสิ้น":        return <CheckCircleOutlined />;
      case "กำลังดำเนินการ":  return <ExclamationCircleOutlined />;
      default:                 return <ClockCircleOutlined />;
    }
  };

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
        let name = s?.name || "ไม่ระบุสถานะ";
        return (
          <Tag
            color={color}
            icon={
              s
                ? getStatusIcon({ ID: s.ID, id: s.id, name, color: s.color })
                : getStatusIcon(undefined)
            }
            style={{ borderRadius: 16, padding: "4px 12px", fontWeight: 600, marginBottom: 4 }}
          >
            {name}
          </Tag>
        );
      },
    },
    {
      title: "เปลี่ยนสถานะ",
      key: "action",
      width: 180,
      render: (record: Petition) => {
        // Use record.State.name (string) for value, fallback to first option
        const currentStateName = typeof record.State?.name === 'string' ? record.State.name : (stateOptions.length > 0 ? stateOptions[0].value : undefined);
        console.log('[DEBUG] Select render', { record, currentStateName });
        return (
          <Select
            style={{ width: 150 }}
            placeholder="เลือกสถานะ"
            value={currentStateName}
            options={stateOptions}
            onClick={() => {
              console.log('[DEBUG] Select clicked', { record });
            }}
            onChange={async (_value: string, option: any) => {
              // Debug: log at the very start of onChange
              console.log('[DEBUG] onChange called',  _value);
              try {
                console.log('[DEBUG] Entering try block');
                const stateName = _value;
                 const stateID = option?.key;
                 console.log('[DEBUG] Entering try',stateID);
                // Log selected value, stateName, and option (with fallback)
                if (typeof window !== 'undefined' && window.console) {
                  window.console.log("[LOG] เลือกสถานะใหม่:", { selectedValue: _value, stateName, option, record });
                }
                message.info(`กำลังอัปเดตสถานะ id=${record.ID} → state_name=${stateName}`);
                // Find the state object by name
                let newState: State | undefined = states.find(s => s.name === stateName);
                await UpdatePetitionStatus(record.ID.toString(), stateID);
                message.success("อัปเดตสถานะสำเร็จ");
                // ถ้าเลือก state ที่ชื่อ "อนุมัติแล้ว" ให้แปลงเป็น "เสร็จสิ้น"
                if (newState && newState.name === "อนุมัติแล้ว") {
                  newState = { ...newState, name: "เสร็จสิ้น" };
                }
                setPetitions(prev => {
                  const updated = prev.map(p =>
                    p.ID === record.ID ? { ...p, State: newState || null } : p
                  );
                  setFilteredPetitions(filtered =>
                    filtered.map(p =>
                      p.ID === record.ID ? { ...p, State: newState || null } : p
                    )
                  );
                  return updated;
                });
              } catch (err: any) {
                console.error("UpdatePetitionState error", err);
                message.error("อัปเดตสถานะไม่สำเร็จ: " + (err?.message || ""));
              }
              console.log('[DEBUG] onChange finished');
            }}
            size="small"
          />
        );
      },
    },
  ];

  return (
    
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Kanit', sans-serif" }}>
      <div style={{ 
        padding: "24px 32px",
        background: "white",
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        fontFamily: "'Kanit', sans-serif"
      }}>
        <div style={{ 
          fontSize: "1.75rem", 
          fontWeight: 600, 
          color: "#111827",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'Kanit', sans-serif"
        }}>
          <FileTextOutlined /> ตรวจสอบคำร้อง
        </div>
      </div>
      <Content style={{ padding: "24px 32px", background: "#f0f2f5", fontFamily: "'Kanit', sans-serif" }}>
  <Row gutter={[24, 24]} style={{ marginBottom: 24, fontFamily: "'Kanit', sans-serif" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: 8,
                textAlign: "center",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)",
                fontFamily: "'Kanit', sans-serif"
              }}
            >
              <Statistic 
                title={<span style={{ fontSize: "1rem", color: "#666", fontFamily: "'Kanit', sans-serif" }}>คำร้องทั้งหมด</span>}
                value={stats.total}
                prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontWeight: 700, fontSize: "2rem", fontFamily: "'Kanit', sans-serif" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: 8,
                textAlign: "center",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)",
                fontFamily: "'Kanit', sans-serif"
              }}
            >
              <Statistic 
                title={<span style={{ fontSize: "1rem", color: "#666", fontFamily: "'Kanit', sans-serif" }}>รอตรวจสอบ</span>}
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{ color: "#fa8c16", fontWeight: 700, fontSize: "2rem", fontFamily: "'Kanit', sans-serif" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: 8,
                textAlign: "center",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)",
                fontFamily: "'Kanit', sans-serif"
              }}
            >
              <Statistic 
                title={<span style={{ fontSize: "1rem", color: "#666", fontFamily: "'Kanit', sans-serif" }}>กำลังดำเนินการ</span>}
                value={stats.processing}
                prefix={<ExclamationCircleOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontWeight: 700, fontSize: "2rem", fontFamily: "'Kanit', sans-serif" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: 8,
                textAlign: "center",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)",
                fontFamily: "'Kanit', sans-serif"
              }}
            >
              <Statistic 
                title={<span style={{ fontSize: "1rem", color: "#666", fontFamily: "'Kanit', sans-serif" }}>เสร็จสิ้น</span>}
                value={stats.approved}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a", fontWeight: 700, fontSize: "2rem", fontFamily: "'Kanit', sans-serif" }}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          style={{ 
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            fontFamily: "'Kanit', sans-serif"
          }}
        >
          <Table
            columns={petitionColumns}
            dataSource={filteredPetitions}
            rowKey="ID"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
              style: { marginTop: 16, fontFamily: "'Kanit', sans-serif" }
            }}
            locale={{
              emptyText: <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={
                  <span style={{ color: "#666", fontSize: "1rem", fontFamily: "'Kanit', sans-serif" }}>
                    ไม่พบข้อมูลคำร้อง
                  </span>
                } 
              />,
            }}
            style={{
              backgroundColor: "#fff",
              fontFamily: "'Kanit', sans-serif"
            }}
            rowClassName={() => "table-row-hover"}
          />
        </Card>
      </Content>
    </Layout>
  );
};
export default StatePetition;
