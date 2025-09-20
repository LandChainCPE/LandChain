import React, { useState, useEffect } from "react";
import { Spin, Alert, Tag, Button, Descriptions, Row, Col, Typography, Empty, message, DatePicker } from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined, FileTextOutlined, ReloadOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { GetUserBookings } from "../../service/https/jo/index";
import Navbar from "../../component/user/Navbar";
import dayjs from "dayjs";
import "./appointmentstatus.css";

const { Text } = Typography;

// เพิ่ม interfaces สำหรับข้อมูลการจอง
interface Booking {
  ID: number;
  date_booking: string; // เปลี่ยนจาก Date เป็น date_booking
  user_id: number;
  branch_id: number;
  time_id: number;
  service_type_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  timework?: string; // เพิ่ม timework ที่เห็นในข้อมูล
  province?: string; // เพิ่ม province
  branch?: string; // เพิ่ม branch name
  // Related data
  Branch?: {
    ID: number;
    Name: string;
    Address: string;
    Province?: { NameTH: string };
    District?: { NameTH: string };
    Subdistrict?: { NameTH: string };
  };
  Time?: {
    ID: number;
    StartTime: string;
    EndTime: string;
  };
  ServiceType?: {
    ID: number;
    Name: string;
    Description: string;
  };
  User?: {
    ID: number;
    FirstName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
  };
}

const AppointmentStatus: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const currentUserId = Number(localStorage.getItem("user_id") || 1);

  // ฟังก์ชันสำหรับแปลงสถานะเป็นภาษาไทย
  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: "รอการอนุมัติ", color: "orange" },
      success: { text: "อนุมัติการจอง", color: "green" },
      approved: { text: "อนุมัติแล้ว", color: "green" },
      rejected: { text: "ปฏิเสธ", color: "red" },
      cancelled: { text: "ยกเลิก", color: "gray" },
      completed: { text: "เสร็จสิ้น", color: "blue" },
    };
    return statusMap[status?.toLowerCase()] || { text: status, color: "default" };
  };

  // ฟังก์ชันสำหรับแปลงวันที่
  const formatDate = (dateString: string) => {
    if (!dateString) return "ไม่มีข้อมูลวันที่";
    
    try {
      // ถ้าเป็นรูปแบบ "2025-09-20T00:00:00Z" หรือ "2025-09-20"
      const date = new Date(dateString);
      
      // ตรวจสอบว่าวันที่ valid หรือไม่
      if (isNaN(date.getTime())) {
        return dateString; // ถ้าไม่ valid ให้แสดงข้อมูลเดิม
      }
      
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long", 
        day: "numeric",
        weekday: "long"
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // ฟังก์ชันสำหรับแปลงเวลา
  const formatTime = (timeString: string) => {
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    } catch {
      return timeString;
    }
  };

  // ฟังก์ชันกรองข้อมูล
  const filterBookings = () => {
    let filtered = [...bookings];

    if (selectedDate) {
      const targetDate = selectedDate.startOf('day');
      const nextDay = selectedDate.add(1, 'day').startOf('day');
      
      filtered = filtered.filter(booking => {
        const bookingDate = dayjs(booking.date_booking);
        return bookingDate.isAfter(targetDate.subtract(1, 'second')) && 
               bookingDate.isBefore(nextDay);
      });
    }

    setFilteredBookings(filtered);
  };

  // ดึงข้อมูลการจองของผู้ใช้
  const fetchUserBookings = async () => {
    try {
      setError(null);
      const response = await GetUserBookings(currentUserId);
      console.log("User bookings response:", response);
      
      if (response && Array.isArray(response)) {
        // Debug แต่ละ booking
        console.log("Total bookings received:", response.length);
        response.forEach((booking, index) => {
          console.log(`Booking ${index}:`, booking);
          console.log(`  - ID: ${booking.ID}`);
          console.log(`  - Date: ${booking.date_booking}`);
          console.log(`  - Timework: ${booking.timework}`);
          console.log(`  - Province: "${booking.province}" (type: ${typeof booking.province})`);
          console.log(`  - Branch: "${booking.branch}" (type: ${typeof booking.branch})`);
          console.log(`  - Status: ${booking.status}`);
        });
        setBookings(response);
        setFilteredBookings(response);
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      setError("ไม่สามารถดึงข้อมูลการจองได้");
      setBookings([]);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจอง");
    }
  };

  // Refresh ข้อมูล
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserBookings();
    setRefreshing(false);
    message.success("อัปเดตข้อมูลแล้ว");
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Load bookings
      await fetchUserBookings();
      setLoading(false);
    };
    
    loadData();
  }, [currentUserId]);

  // Effect สำหรับกรองข้อมูลเมื่อ filter เปลี่ยน
  useEffect(() => {
    filterBookings();
  }, [bookings, selectedDate]);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px",
        background: "#f5f5f5"
      }}>
        <Spin size="large" tip="กำลังโหลดข้อมูลการจอง..." />
      </div>
    );
  }

  // ฟังก์ชันล้างตัวกรอง
  const clearFilters = () => {
    setSelectedDate(null);
  };

  return (
    <div className="appointment-status-container">
      <Navbar />
      
      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">ประวัติการจองนัดหมาย</span>
          </h1>
          <p className="hero-subtitle">
            ตรวจสอบสถานะการจองและประวัติการติดต่อกรมที่ดิน
            <br />
            ระบบการจัดการนัดหมายแบบออนไลน์
          </p>
        </div>
      </div>

      <div className="main-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-glow"></div>
          <div style={{ padding: "2rem" }}>
            <div className="section-header">
              <div className="form-icon">
                <CalendarOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <span className="section-title">รายการการจองของคุณ</span>
              <Button 
                type="primary"
                icon={<ReloadOutlined />}
                loading={refreshing}
                onClick={handleRefresh}
                className="btn-modern"
                style={{ marginLeft: "auto" }}
              >
                อัปเดตข้อมูล
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-glow"></div>
          <div style={{ padding: "1.5rem" }}>
            <div className="section-header" style={{ marginBottom: "1rem" }}>
              <div className="form-icon">
                <FilterOutlined style={{ fontSize: "1.2rem" }} />
              </div>
              <span className="section-title">ตัวกรอง</span>
            </div>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--primary-dark)", fontWeight: "500" }}>
                  วันที่จอง:
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder="เลือกวันที่"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  className="modern-datepicker"
                />
              </Col>

              <Col xs={24} sm={12} md={8}>
                <div style={{ marginTop: "32px" }}>
                  <Button 
                    type="primary" 
                    onClick={clearFilters}
                    className="btn-modern"
                    icon={<ClearOutlined />}
                  >
                    ล้างตัวกรอง
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: "24px" }}
            action={
              <Button size="small" onClick={handleRefresh}>
                ลองใหม่
              </Button>
            }
          />
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="glass-card">
            <div className="card-glow"></div>
            <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
              <Empty
                description={bookings.length === 0 ? "ยังไม่มีการจองนัดหมาย" : "ไม่พบการจองที่ตรงกับเงื่อนไขการค้นหา"}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                {bookings.length === 0 ? (
                  <Button type="primary" href="/user/regisland" className="btn-modern">
                    จองนัดหมายใหม่
                  </Button>
                ) : (
                  <Button onClick={clearFilters} className="btn-modern">
                    ล้างตัวกรอง
                  </Button>
                )}
              </Empty>
            </div>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredBookings.map((booking) => {
              const statusInfo = getStatusText(booking.status);
              
              return (
                <Col xs={24} lg={12} key={booking.ID}>
                  <div className="status-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <Text strong style={{ fontSize: "1.1rem", color: "var(--primary-dark)" }}>การจอง #{booking.ID}</Text>
                      <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                    </div>
                    <Descriptions column={1} size="small">
                      {/* แสดงจังหวัดและสาขาที่จอง */}
                      {booking.province && (
                        <Descriptions.Item 
                          label={<><EnvironmentOutlined style={{ color: "var(--primary-light)" }} /> จังหวัด</>}
                        >
                          <Text strong style={{ color: "var(--primary-light)" }}>{booking.province}</Text>
                        </Descriptions.Item>
                      )}
                      
                      {booking.branch && (
                        <Descriptions.Item 
                          label={<><EnvironmentOutlined style={{ color: "#52c41a" }} /> สาขา</>}
                        >
                          <Text strong style={{ color: "#52c41a" }}>{booking.branch}</Text>
                        </Descriptions.Item>
                      )}
                      
                      <Descriptions.Item 
                        label={<><CalendarOutlined /> วันที่จอง</>}
                      >
                        {formatDate(booking.date_booking)}
                      </Descriptions.Item>
                      
                      {booking.timework && (
                        <Descriptions.Item 
                          label={<><ClockCircleOutlined /> เวลา</>}
                        >
                          {booking.timework}
                        </Descriptions.Item>
                      )}
                      
                      {booking.Time && (
                        <Descriptions.Item 
                          label={<><ClockCircleOutlined /> เวลาบริการ</>}
                        >
                          {formatTime(booking.Time.StartTime)} - {formatTime(booking.Time.EndTime)}
                        </Descriptions.Item>
                      )}
                      
                      {booking.Branch && (
                        <Descriptions.Item 
                          label={<><EnvironmentOutlined /> สาขา</>}
                        >
                          <div>
                            <div style={{ fontWeight: "bold" }}>{booking.Branch.Name}</div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {booking.Branch.Address}
                              {booking.Branch.Subdistrict?.NameTH && ` ${booking.Branch.Subdistrict.NameTH}`}
                              {booking.Branch.District?.NameTH && ` ${booking.Branch.District.NameTH}`}
                              {booking.Branch.Province?.NameTH && ` ${booking.Branch.Province.NameTH}`}
                            </Text>
                          </div>
                        </Descriptions.Item>
                      )}
                      
                      {booking.ServiceType && (
                        <Descriptions.Item 
                          label={<><FileTextOutlined /> ประเภทบริการ</>}
                        >
                          <div>
                            <div style={{ fontWeight: "bold" }}>{booking.ServiceType.Name}</div>
                            {booking.ServiceType.Description && (
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                {booking.ServiceType.Description}
                              </Text>
                            )}
                          </div>
                        </Descriptions.Item>
                      )}
                      
                      {booking.User && (
                        <Descriptions.Item 
                          label={<><UserOutlined /> ผู้จอง</>}
                        >
                          <div>
                            <div>{booking.User.FirstName} {booking.User.LastName}</div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {booking.User.Email}
                              {booking.User.PhoneNumber && ` | ${booking.User.PhoneNumber}`}
                            </Text>
                          </div>
                        </Descriptions.Item>
                      )}
                      
                      <Descriptions.Item 
                        label="วันที่สร้าง"
                      >
                        <Text type="secondary">
                          {formatDate(booking.created_at)}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Summary */}
        {bookings.length > 0 && (
          <div className="glass-card" style={{ marginTop: "24px" }}>
            <div className="card-glow"></div>
            <div style={{ padding: "2rem" }}>
              <div className="section-header">
                <div className="form-icon">
                  <CalendarOutlined style={{ fontSize: "1.5rem" }} />
                </div>
                <span className="section-title">สรุปการจอง</span>
                {filteredBookings.length !== bookings.length && (
                  <Text type="secondary" style={{ fontSize: "14px", marginLeft: "auto" }}>
                    แสดง {filteredBookings.length} จาก {bookings.length} รายการ
                  </Text>
                )}
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <div className="summary-stat-card">
                    <div className="stat-number">
                      {filteredBookings.length}
                    </div>
                    <div className="stat-label">ทั้งหมด{filteredBookings.length !== bookings.length ? " (กรองแล้ว)" : ""}</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="summary-stat-card">
                    <div className="stat-number" style={{ color: "#faad14" }}>
                      {filteredBookings.filter(b => b.status?.toLowerCase() === "pending").length}
                    </div>
                    <div className="stat-label">รอการอนุมัติ</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="summary-stat-card">
                    <div className="stat-number" style={{ color: "#52c41a" }}>
                      {filteredBookings.filter(b => b.status?.toLowerCase() === "success").length}
                    </div>
                    <div className="stat-label">อนุมัติแล้ว</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="summary-stat-card">
                    <div className="stat-number" style={{ color: "#ff4d4f" }}>
                      {filteredBookings.filter(b => ["rejected", "cancelled"].includes(b.status?.toLowerCase())).length}
                    </div>
                    <div className="stat-label">ปฏิเสธ/ยกเลิก</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentStatus;
