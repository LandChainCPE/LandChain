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

  const userId = localStorage.getItem("user_id");

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        tel: formData.phone,
        email: formData.email,
        description: formData.content,
        date: formData.date,
        topic: formData.title,
        user_id: Number(userId),
      };

      await CreatePetition(payload);
      
      message.success("✅ ส่งคำร้องสำเร็จ!");
      setCurrentStep(2);

      // After successful submission, redirect to another page
      setTimeout(() => {
        navigate("/user/userdashboard");
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
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, rgba(23, 46, 37, 0.05) 0%, rgba(63, 86, 88, 0.08) 50%, rgba(111, 150, 155, 0.1) 100%)", 
      padding: "2rem",
      position: "relative"
    }}>
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 80%, rgba(111, 150, 155, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(63, 86, 88, 0.08) 0%, transparent 50%)",
        pointerEvents: "none"
      }}></div>
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        {/* Enhanced Header */}
        <div style={{ 
          marginBottom: "2rem", 
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))",
          borderRadius: "1.5rem", 
          border: "2px solid rgba(111, 150, 155, 0.2)", 
          boxShadow: "0 12px 40px rgba(23, 46, 37, 0.15)",
          overflow: "hidden",
          backdropFilter: "blur(20px)"
        }}>
          {/* Header Gradient */}
          <div style={{
            background: "linear-gradient(135deg, #172E25 0%, #3F5658 50%, #6F969B 100%)",
            padding: "2rem 2.5rem 1rem 2.5rem",
            position: "relative"
          }}>
            {/* Header Pattern */}
            <div style={{
              position: "absolute",
              inset: "0",
              background: "radial-gradient(circle at 30% 40%, rgba(111, 150, 155, 0.3) 0%, transparent 50%)",
              animation: "pulse 4s ease-in-out infinite"
            }}></div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 10 }}>
              <div>
                <Title level={2} style={{ 
                  margin: 0, 
                  color: "#ffffff",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  letterSpacing: "0.02em"
                }}>
                  📝 ยื่นคำร้องเรื่องเอกสาร
                </Title>
                <Text style={{ 
                  color: "rgba(255, 255, 255, 0.9)", 
                  fontSize: "1.1rem",
                  fontWeight: "500"
                }}>
                  กรอกข้อมูลเพื่อยื่นคำร้องขอเอกสารที่ดิน
                </Text>
              </div>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/user/dashboard")} 
                size="large"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  color: "#ffffff",
                  borderRadius: "1rem",
                  fontWeight: "600",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                กลับ
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Steps */}
        <div style={{ 
          marginBottom: "2rem", 
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))",
          borderRadius: "1.5rem", 
          border: "2px solid rgba(111, 150, 155, 0.2)", 
          boxShadow: "0 8px 32px rgba(23, 46, 37, 0.1)",
          padding: "2rem",
          backdropFilter: "blur(20px)"
        }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <Title level={4} style={{ 
              margin: 0, 
              color: "#172E25",
              fontWeight: "700",
              fontSize: "1.3rem"
            }}>
              ขั้นตอนการดำเนินการ
            </Title>
            <Text style={{ color: "#3F5658", fontSize: "1rem" }}>
              ติดตามความคืบหน้าในการยื่นคำร้อง
            </Text>
          </div>
          <Steps 
            current={currentStep} 
            items={steps.map((step, index) => ({
              ...step,
              icon: React.cloneElement(step.icon, {
                style: { 
                  color: index <= currentStep ? "#6F969B" : "#94a3b8" 
                }
              })
            }))}
            // style={{
            //   '.ant-steps-item-finish .ant-steps-item-icon': {
            //     backgroundColor: '#6F969B',
            //     borderColor: '#6F969B'
            //   },
            //   '.ant-steps-item-process .ant-steps-item-icon': {
            //     backgroundColor: '#6F969B',
            //     borderColor: '#6F969B'
            //   }
            // }}
          />
        </div>

        {/* Enhanced Main Form */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))",
          borderRadius: "1.5rem", 
          border: "2px solid rgba(111, 150, 155, 0.2)", 
          boxShadow: "0 16px 48px rgba(23, 46, 37, 0.12)", 
          overflow: "hidden",
          backdropFilter: "blur(20px)"
        }}>
          {/* Form Header */}
          <div style={{ 
            background: "linear-gradient(135deg, #172E25 0%, #3F5658 50%, #6F969B 100%)", 
            padding: "2rem 2.5rem", 
            color: "white",
            position: "relative"
          }}>
            {/* Subtle pattern overlay */}
            <div style={{
              position: "absolute",
              inset: "0",
              background: "radial-gradient(circle at 70% 30%, rgba(111, 150, 155, 0.3) 0%, transparent 50%)",
              pointerEvents: "none"
            }}></div>
            
            <div style={{ position: "relative", zIndex: 10 }}>
              <Title level={3} style={{ 
                color: "white", 
                margin: "0 0 0.5rem 0",
                fontSize: "1.8rem",
                fontWeight: "800"
              }}>
                📋 ข้อมูลคำร้อง
              </Title>
              <Text style={{ 
                color: "rgba(255,255,255,0.9)",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}>
                กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง เพื่อความรวดเร็วในการพิจารณา
              </Text>
            </div>
          </div>

          <div style={{ padding: "2.5rem" }}>
            {/* Date and Title Row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "2.5rem"
            }}>
              {/* วันที่ */}
              <div>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#172E25",
                  marginBottom: "0.75rem"
                }}>
                  <CalendarOutlined style={{ marginRight: "0.5rem", color: "#6F969B", fontSize: "1.1rem" }} /> 
                  วันที่ <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  style={{ 
                    padding: "1rem 1.25rem", 
                    borderRadius: "1rem", 
                    width: "100%", 
                    border: "2px solid rgba(111, 150, 155, 0.3)",
                    fontSize: "1rem",
                    fontWeight: "500",
                    background: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#6F969B";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(111, 150, 155, 0.2)";
                    e.currentTarget.style.background = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(111, 150, 155, 0.3)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                  }}
                />
              </div>

              {/* เรื่อง */}
              <div>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#172E25",
                  marginBottom: "0.75rem"
                }}>
                  <FileTextOutlined style={{ marginRight: "0.5rem", color: "#6F969B", fontSize: "1.1rem" }} /> 
                  เรื่อง <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="ระบุหัวข้อเรื่องที่ต้องการยื่นคำร้อง"
                  size="large"
                  style={{ 
                    borderRadius: "1rem",
                    border: "2px solid rgba(111, 150, 155, 0.3)",
                    padding: "1rem 1.25rem",
                    fontSize: "1rem",
                    background: "rgba(255, 255, 255, 0.8)"
                  }}
                />
              </div>
            </div>

            {/* Personal Info Section */}
            <div style={{
              background: "linear-gradient(135deg, rgba(111, 150, 155, 0.08), rgba(63, 86, 88, 0.05))",
              padding: "2rem",
              borderRadius: "1.25rem",
              border: "2px solid rgba(111, 150, 155, 0.15)",
              marginBottom: "2.5rem"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #6F969B, #3F5658)",
                  borderRadius: "50%",
                  padding: "0.75rem",
                  marginRight: "1rem"
                }}>
                  <UserOutlined style={{ color: "white", fontSize: "1.2rem" }} />
                </div>
                <div>
                  <Title level={4} style={{ 
                    margin: 0, 
                    color: "#172E25",
                    fontSize: "1.3rem",
                    fontWeight: "700"
                  }}>
                    ข้อมูลส่วนตัว
                  </Title>
                  <Text style={{ color: "#3F5658", fontSize: "1rem" }}>
                    กรอกข้อมูลผู้ยื่นคำร้อง
                  </Text>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                marginBottom: "2rem"
              }}>
                {/* ชื่อ */}
                <div>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#172E25",
                    marginBottom: "0.75rem"
                  }}>
                    ชื่อ <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="กรอกชื่อ"
                    size="large"
                    style={{ 
                      borderRadius: "1rem",
                      border: "2px solid rgba(111, 150, 155, 0.3)",
                      padding: "1rem 1.25rem",
                      fontSize: "1rem",
                      background: "rgba(255, 255, 255, 0.9)"
                    }}
                  />
                </div>

                {/* นามสกุล */}
                <div>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#172E25",
                    marginBottom: "0.75rem"
                  }}>
                    นามสกุล <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="กรอกนามสกุล"
                    size="large"
                    style={{ 
                      borderRadius: "1rem",
                      border: "2px solid rgba(111, 150, 155, 0.3)",
                      padding: "1rem 1.25rem",
                      fontSize: "1rem",
                      background: "rgba(255, 255, 255, 0.9)"
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem"
              }}>
                {/* เบอร์โทร */}
                <div>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#172E25",
                    marginBottom: "0.75rem"
                  }}>
                    <PhoneOutlined style={{ marginRight: "0.5rem", color: "#6F969B", fontSize: "1.1rem" }} /> 
                    เบอร์โทร <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                    size="large"
                    style={{ 
                      borderRadius: "1rem",
                      border: "2px solid rgba(111, 150, 155, 0.3)",
                      padding: "1rem 1.25rem",
                      fontSize: "1rem",
                      background: "rgba(255, 255, 255, 0.9)"
                    }}
                    maxLength={10}
                  />
                </div>

                {/* อีเมล */}
                <div>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#172E25",
                    marginBottom: "0.75rem"
                  }}>
                    <MailOutlined style={{ marginRight: "0.5rem", color: "#6F969B", fontSize: "1.1rem" }} /> 
                    อีเมล
                  </label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="กรอกอีเมล (ไม่บังคับ)"
                    size="large"
                    style={{ 
                      borderRadius: "1rem",
                      border: "2px solid rgba(111, 150, 155, 0.3)",
                      padding: "1rem 1.25rem",
                      fontSize: "1rem",
                      background: "rgba(255, 255, 255, 0.9)"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Petition Details Section */}
            <div style={{
              background: "linear-gradient(135deg, rgba(111, 150, 155, 0.08), rgba(63, 86, 88, 0.05))",
              padding: "2rem",
              borderRadius: "1.25rem",
              border: "2px solid rgba(111, 150, 155, 0.15)",
              marginBottom: "2.5rem"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #6F969B, #3F5658)",
                  borderRadius: "50%",
                  padding: "0.75rem",
                  marginRight: "1rem"
                }}>
                  <FileTextOutlined style={{ color: "white", fontSize: "1.2rem" }} />
                </div>
                <div>
                  <Title level={4} style={{ 
                    margin: 0, 
                    color: "#172E25",
                    fontSize: "1.3rem",
                    fontWeight: "700"
                  }}>
                    รายละเอียดคำร้อง
                  </Title>
                  <Text style={{ color: "#3F5658", fontSize: "1rem" }}>
                    ระบุเหตุผลและรายละเอียดการยื่นคำร้อง
                  </Text>
                </div>
              </div>

              <div>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#172E25",
                  marginBottom: "0.75rem"
                }}>
                  เหตุผลที่ยื่นขอ <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>
                </label>
                <TextArea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="กรุณาระบุเหตุผลและรายละเอียดการยื่นคำร้อง เช่น ขอเอกสารเพื่อใช้ในการขายที่ดิน, ขอเอกสารเพื่อการจดทะเบียนสมรส, ฯลฯ"
                  rows={6}
                  style={{ 
                    borderRadius: "1rem",
                    border: "2px solid rgba(111, 150, 155, 0.3)",
                    padding: "1rem 1.25rem",
                    fontSize: "1rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    resize: "vertical",
                    lineHeight: "1.6"
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(111, 150, 155, 0.1), rgba(63, 86, 88, 0.08))",
              padding: "2.5rem", 
              borderRadius: "1.25rem", 
              textAlign: "center",
              border: "2px solid rgba(111, 150, 155, 0.2)"
            }}>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  style={{
                    background: "linear-gradient(135deg, #6F969B 0%, #3F5658 100%)",
                    border: "none",
                    borderRadius: "1.25rem",
                    height: "3.5rem",
                    paddingLeft: "2.5rem",
                    paddingRight: "2.5rem",
                    fontWeight: "700",
                    fontSize: "1.1rem",
                    boxShadow: "0 8px 24px rgba(111, 150, 155, 0.4)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #5a8087, #2f484a)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(111, 150, 155, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #6F969B, #3F5658)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(111, 150, 155, 0.4)";
                  }}
                >
                  {loading ? "กำลังส่งคำร้อง..." : "🚀 ส่งคำร้อง"}
                </Button>

                <Button
                  size="large"
                  onClick={handleReset}
                  icon={<ReloadOutlined />}
                  style={{
                    borderRadius: "1.25rem",
                    height: "3.5rem",
                    paddingLeft: "2.5rem",
                    paddingRight: "2.5rem",
                    fontWeight: "700",
                    fontSize: "1.1rem",
                    border: "2px solid rgba(111, 150, 155, 0.3)",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#3F5658",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(111, 150, 155, 0.1)";
                    e.currentTarget.style.borderColor = "#6F969B";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.borderColor = "rgba(111, 150, 155, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  🔄 รีเซ็ต
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Ant Design Steps customization */
        .ant-steps-item-finish .ant-steps-item-icon {
          background-color: #6F969B !important;
          border-color: #6F969B !important;
        }
        
        .ant-steps-item-process .ant-steps-item-icon {
          background-color: #6F969B !important;
          border-color: #6F969B !important;
        }
        
        .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
          color: white !important;
        }
        
        .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
          color: white !important;
        }
        
        .ant-input:focus, .ant-input-focused {
          border-color: #6F969B !important;
          box-shadow: 0 0 0 2px rgba(111, 150, 155, 0.2) !important;
        }
        
        .ant-input:hover {
          border-color: #6F969B !important;
        }
      `}</style>
    </div>
  );
};

export default Petition;
