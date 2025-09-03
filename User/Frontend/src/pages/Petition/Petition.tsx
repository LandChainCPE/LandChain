import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Space, Typography, Row, Col, message, Steps, Divider } from "antd";
import { FileTextOutlined, UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, SendOutlined, ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { CreatePetition } from "../../service/https/jib/jib"; 

const { Title, Text } = Typography;
const { TextArea } = Input;

const Petition: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: "",
    prefix: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.phone) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

  //const userId = localStorage.getItem("id");

//อย่าลืมแก้ตรงState,user_id
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        tel: formData.phone,
        email: formData.email,
        description: formData.content,
        date: formData.date,
        topic: formData.title,
        state_id: 1,
        user_id: 1,
      };

      // Call CreatePetition to create the petition
      await CreatePetition(payload);
      
      message.success("✅ ส่งคำร้องสำเร็จ!");
      setCurrentStep(2);

      // After successful submission, redirect to another page
      setTimeout(() => {
        navigate("/user/state");
      }, 2000);
    } catch (error) {
      message.error("❌ เกิดข้อผิดพลาด: " + (error || "ไม่ทราบสาเหตุ"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      content: "",
      date: "",
      prefix: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setCurrentStep(0);
    message.info("รีเซ็ตฟอร์มเรียบร้อย");
  };

  const steps = [
    { title: 'กรอกข้อมูล', icon: <FileTextOutlined /> },
    { title: 'ตรวจสอบ', icon: <UserOutlined /> },
    { title: 'เสร็จสิ้น', icon: <SendOutlined /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, borderRadius: 16, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Title level={2} style={{ margin: 0, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                📝 ยื่นคำร้องเรื่องเอกสาร
              </Title>
              <Text type="secondary">กรอกข้อมูลเพื่อยื่นคำร้องขอเอกสาร</Text>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/user/dashboard")} size="large">
              กลับ
            </Button>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card style={{ marginBottom: 24, borderRadius: 16, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <Steps current={currentStep} items={steps} />
        </Card>

        {/* Main Form */}
        <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", margin: "-24px -24px 24px -24px", padding: "24px", color: "white" }}>
            <Title level={3} style={{ color: "white", margin: 0 }}>
              ข้อมูลคำร้อง
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
              กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
            </Text>
          </div>

          <div>
            <Row gutter={24}>
              {/* วันที่ */}
              <Col span={12}>
                <Form.Item label={<span><CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} /> วันที่</span>} required>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={{ padding: "8px", borderRadius: "8px", width: "300px", marginLeft: "10px", border: "1px solid #ccc" }}
                  />
                </Form.Item>
              </Col>

              {/* เรื่อง */}
              <Col span={12}>
                <Form.Item label={<span><FileTextOutlined style={{ marginRight: 8, color: "#52c41a" }} /> เรื่อง</span>} required>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="ระบุหัวข้อเรื่องที่ต้องการยื่นคำร้อง"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">
              <span style={{ color: "#1890ff", fontWeight: 600 }}>👤 ข้อมูลส่วนตัว</span>
            </Divider>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label={<span><UserOutlined style={{ marginRight: 8, color: "#1890ff" }} /> ชื่อ</span>} required>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="กรอกชื่อ"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label={<span><UserOutlined style={{ marginRight: 8, color: "#1890ff" }} /> นามสกุล</span>} required>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="กรอกนามสกุล"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label={<span><PhoneOutlined style={{ marginRight: 8, color: "#fa8c16" }} /> เบอร์โทร</span>} required>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                    size="large"
                    style={{ borderRadius: 8 }}
                    maxLength={10}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label={<span><MailOutlined style={{ marginRight: 8, color: "#eb2f96" }} /> อีเมล </span>}>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="กรอกอีเมล"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">
              <span style={{ color: "#52c41a", fontWeight: 600 }}>📋 รายละเอียดคำร้อง</span>
            </Divider>

            <Form.Item label={<span><FileTextOutlined style={{ marginRight: 8, color: "#52c41a" }} /> เหตุผลที่ยื่นขอ</span>} required>
              <TextArea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="กรุณาระบุเหตุผลและรายละเอียดการยื่นคำร้อง..."
                rows={6}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <div style={{ marginTop: 32, padding: "24px", background: "#f8f9fa", borderRadius: 12, textAlign: "center" }}>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  style={{
                    background: "linear-gradient(135deg, #00994C 0%, #00b956 100%)",
                    border: "none",
                    borderRadius: 10,
                    height: 48,
                    paddingLeft: 32,
                    paddingRight: 32,
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: "0 4px 15px rgba(0, 153, 76, 0.3)"
                  }}
                >
                  {loading ? "กำลังส่งคำร้อง..." : "ส่งคำร้อง"}
                </Button>

                <Button
                  size="large"
                  onClick={handleReset}
                  icon={<ReloadOutlined />}
                  style={{
                    borderRadius: 10,
                    height: 48,
                    paddingLeft: 32,
                    paddingRight: 32,
                    fontWeight: 600
                  }}
                >
                  รีเซ็ต
                </Button>
              </Space>
            </div>
          </div>

          {/* Tips */}
          <div style={{ marginTop: 24, padding: 16, background: "linear-gradient(135deg, #e6f7ff 0%, #f6ffed 100%)", borderRadius: 8, border: "1px solid #d9f7be" }}>
            <Text strong style={{ color: "#389e0d" }}>💡 คำแนะนำ:</Text>
            <ul style={{ margin: "8px 0 0 20px", color: "#666" }}>
              <li>กรอกข้อมูลให้ครบถ้วนและถูกต้อง</li>
              <li>ระบุเหตุผลให้ชัดเจนเพื่อความรวดเร็วในการพิจารณา</li>
              <li>ตรวจสอบเบอร์โทรศัพท์ให้ถูกต้องเพื่อการติดต่อกลับ</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Petition;
