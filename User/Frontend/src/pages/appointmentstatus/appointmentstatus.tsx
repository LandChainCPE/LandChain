import React, { useState, useEffect } from "react";
import { Card, Spin, Alert, Tag, Button, Descriptions, Row, Col, Typography, Empty, message, Select, Space } from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined, FileTextOutlined, ReloadOutlined, FilterOutlined } from "@ant-design/icons";
import { GetUserBookings } from "../../service/https/jo/index";

const { Title, Text } = Typography;
const { Option } = Select;

// เพิ่ม interfaces สำหรับจังหวัดและสาขา
interface Province {
  ID: number;
  province: string;
}

interface Branch {
  ID: number;
  branch: string;
  province_id: number;
  Province?: Province;
}

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
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const currentUserId = Number(localStorage.getItem("user_id") || 1);

  // ฟังก์ชันสำหรับแปลงสถานะเป็นภาษาไทย
  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: "รอการอนุมัติ", color: "orange" },
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

  // ดึงข้อมูลจังหวัด
  const fetchProvinces = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/provinces/filter`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      console.log("Provinces API response status:", response.status);
      console.log("Provinces API response headers:", response.headers.get('content-type'));
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log("Provinces data received:", data);
          if (Array.isArray(data) && data.length > 0) {
            setProvinces(data);
            console.log("Successfully set provinces:", data.length, "items");
          }
        } else {
          console.error("Provinces API returned non-JSON response");
          const text = await response.text();
          console.log("Response body:", text.substring(0, 200));
        }
      } else {
        console.error("Failed to fetch provinces:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching provinces:", err);
    }
  };

  // ดึงข้อมูลสาขา
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/branches/filter`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      console.log("Branches API response status:", response.status);
      console.log("Branches API response headers:", response.headers.get('content-type'));
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log("Branches data received:", data);
          if (Array.isArray(data) && data.length > 0) {
            setBranches(data);
            console.log("Successfully set branches:", data.length, "items");
          }
        } else {
          console.error("Branches API returned non-JSON response");
          const text = await response.text();
          console.log("Response body:", text.substring(0, 200));
        }
      } else {
        console.error("Failed to fetch branches:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  // ฟังก์ชันกรองข้อมูล
  const filterBookings = () => {
    let filtered = [...bookings];

    if (selectedProvince) {
      filtered = filtered.filter(booking => booking.province === selectedProvince);
    }

    if (selectedBranch) {
      filtered = filtered.filter(booking => booking.branch === selectedBranch);
    }

    if (selectedStatus) {
      filtered = filtered.filter(booking => booking.status === selectedStatus);
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
        
        // Extract unique provinces and branches from bookings data
        const validBookingsWithProvince = response.filter(booking => booking.province);
        const validBookingsWithBranch = response.filter(booking => booking.branch);
        
        console.log(`Bookings with province data: ${validBookingsWithProvince.length}/${response.length}`);
        console.log(`Bookings with branch data: ${validBookingsWithBranch.length}/${response.length}`);
        
        const uniqueProvinces = Array.from(
          new Set(response.map(booking => booking.province).filter(Boolean))
        ).map((province, index) => ({ ID: index + 1, province: province as string }));
        
        console.log("Unique provinces found:", uniqueProvinces);
        
        if (uniqueProvinces.length === 0) {
          console.warn("No province data found in booking response!");
        }
        
        // Create province-branch mapping from booking data
        const provinceBranchMap = response.reduce((acc, booking) => {
          if (booking.province && booking.branch) {
            if (!acc[booking.province]) {
              acc[booking.province] = new Set<string>();
            }
            acc[booking.province].add(booking.branch);
          }
          return acc;
        }, {} as Record<string, Set<string>>);
        
        // Convert branches with province relationship
        const uniqueBranches = Object.entries(provinceBranchMap).flatMap(([provinceName, branchSet]) => {
          const province = uniqueProvinces.find(p => p.province === provinceName);
          return Array.from(branchSet as Set<string>).map((branch, index) => ({
            ID: index + 1,
            branch: branch,
            province_id: province?.ID || 0,
            Province: { ID: province?.ID || 0, province: provinceName }
          }));
        });
        
        console.log("Extracted provinces:", uniqueProvinces);
        console.log("Extracted branches:", uniqueBranches);
        
        // Always set provinces and branches from booking data since API might not work
        setProvinces(uniqueProvinces);
        setBranches(uniqueBranches);
      } else {
        setBookings([]);
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
      // Load bookings first to get province/branch data
      await fetchUserBookings();
      
      // Try to load additional data from APIs (but don't wait for them)
      fetchProvinces().catch(() => console.log("Provinces API failed, using booking data"));
      fetchBranches().catch(() => console.log("Branches API failed, using booking data"));
      
      setLoading(false);
    };
    
    loadData();
  }, [currentUserId]);

  // Effect สำหรับกรองข้อมูลเมื่อ filter เปลี่ยน
  useEffect(() => {
    filterBookings();
  }, [bookings, selectedProvince, selectedBranch, selectedStatus]);

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
    setSelectedProvince(undefined);
    setSelectedBranch(undefined);
    setSelectedStatus(undefined);
  };

  return (
    <div style={{ 
      padding: "24px", 
      background: "#f5f5f5", 
      minHeight: "100vh" 
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ 
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            <CalendarOutlined style={{ marginRight: "8px" }} />
            ประวัติการจองนัดหมาย
          </Title>
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            อัปเดตข้อมูล
          </Button>
        </div>

        {/* Filter Section */}
        

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
          <Card>
            <Empty
              description={bookings.length === 0 ? "ยังไม่มีการจองนัดหมาย" : "ไม่พบการจองที่ตรงกับเงื่อนไขการค้นหา"}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {bookings.length === 0 ? (
                <Button type="primary" href="/user/regisland">
                  จองนัดหมายใหม่
                </Button>
              ) : (
                <Button onClick={clearFilters}>
                  ล้างตัวกรอง
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredBookings.map((booking) => {
              const statusInfo = getStatusText(booking.status);
              
              return (
                <Col xs={24} lg={12} key={booking.ID}>
                  <Card
                    title={
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text strong>การจอง #{booking.ID}</Text>
                        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                      </div>
                    }
                    style={{ 
                      height: "100%",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                    hoverable
                  >
                    <Descriptions column={1} size="small">
                      {/* แสดงจังหวัดและสาขาที่จอง */}
                      {booking.province && (
                        <Descriptions.Item 
                          label={<><EnvironmentOutlined style={{ color: "#1890ff" }} /> จังหวัด</>}
                        >
                          <Text strong style={{ color: "#1890ff" }}>{booking.province}</Text>
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
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Summary */}
        {bookings.length > 0 && (
          <Card 
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>สรุปการจอง</span>
                {filteredBookings.length !== bookings.length && (
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    แสดง {filteredBookings.length} จาก {bookings.length} รายการ
                  </Text>
                )}
              </div>
            }
            style={{ marginTop: "24px" }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}>
                    {filteredBookings.length}
                  </div>
                  <div>ทั้งหมด{filteredBookings.length !== bookings.length ? " (กรองแล้ว)" : ""}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#faad14" }}>
                    {filteredBookings.filter(b => b.status?.toLowerCase() === "pending").length}
                  </div>
                  <div>รอการอนุมัติ</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}>
                    {filteredBookings.filter(b => b.status?.toLowerCase() === "approved").length}
                  </div>
                  <div>อนุมัติแล้ว</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff4d4f" }}>
                    {filteredBookings.filter(b => ["rejected", "cancelled"].includes(b.status?.toLowerCase())).length}
                  </div>
                  <div>ปฏิเสธ/ยกเลิก</div>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppointmentStatus;
