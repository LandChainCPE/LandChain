import React, { useEffect, useState } from "react";
import { Select, Card, Typography, Spin, message, DatePicker, Modal, Row, Col, Divider, Space, Badge, Timeline, Empty, Button } from "antd";
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, StopOutlined, HistoryOutlined, ReloadOutlined } from "@ant-design/icons";
import { GetBranches, GetProvinces, GetTimeSlots, CreateBooking, GetServiceTypes, GetAvailableSlots, GetBookingStatus, GetUserBookings } from "../../service/https/jo/index";
import type { BookingInterface } from "../../interfaces/Booking";
import dayjs from "dayjs";
import "./RegisLand.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const BookingCalendar = () => {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<number | null>(null);
  const [slotAvailability, setSlotAvailability] = useState<Record<number, number>>({});
  const [confirmationVisible, setConfirmationVisible] = useState<boolean>(false);
  const [bookingDetails, setBookingDetails] = useState<BookingInterface | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [bookingStatusMap, setBookingStatusMap] = useState<Record<number, string>>({});
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const currentUserId = Number(localStorage.getItem("user_id") || 1);

  const fetchUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const bookings = await GetUserBookings(currentUserId);
      console.log("User bookings fetched: ", bookings);

      // แก้ไขการจัดการค่า null/undefined
      if (bookings && Array.isArray(bookings)) {
        setUserBookings(bookings);
      } else {
        setUserBookings([]); // ตั้งเป็น array ว่างถ้าเป็น null หรือไม่ใช่ array
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]); // ตั้งเป็น array ว่างเมื่อ error
      message.error("ไม่สามารถดึงข้อมูลการจองได้");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [currentUserId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provincesData = await GetProvinces();
        setProvinces(Array.isArray(provincesData) ? provincesData : []);

        const serviceTypesData = await GetServiceTypes();
        setServiceTypes(Array.isArray(serviceTypesData) ? serviceTypesData : []);

        const timeSlotsData = await GetTimeSlots();
        setTimes(Array.isArray(timeSlotsData) ? timeSlotsData : []);

        if (selectedProvince) {
          const branchesData = await GetBranches();
          const filteredBranches = Array.isArray(branchesData)
            ? branchesData.filter((b: any) => b.ProvinceID === selectedProvince)
            : [];
          setBranches(filteredBranches);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // ตั้งค่าเป็น array ว่างเมื่อเกิด error
        setProvinces([]);
        setServiceTypes([]);
        setTimes([]);
        setBranches([]);
      }
    };

    fetchData();
  }, [selectedProvince]);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedDate || !selectedBranch) return;

      const newAvailability: Record<number, number> = {};

      for (const time of times) {
        try {
          const res = await GetAvailableSlots(selectedDate, selectedBranch, time.ID);
          newAvailability[time.ID] = res?.available_slots || 0;
        } catch (error) {
          console.error(`Error fetching available slots for time ${time.ID}:`, error);
          newAvailability[time.ID] = 0;
        }
      }

      setSlotAvailability(newAvailability);
    };

    if (selectedDate && selectedBranch && times.length > 0) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedBranch, times]);

  useEffect(() => {
    const checkUserBookingStatus = async () => {
      if (!selectedDate || !selectedBranch) {
        setBookingStatusMap({});
        return;
      }

      try {
        const bookingsResponse = await GetBookingStatus(
          currentUserId,
          selectedBranch,
          selectedDate
        );

        if (Array.isArray(bookingsResponse)) {
          const statusMap: Record<number, string> = {};

          bookingsResponse.forEach((item: any) => {
            if (item.time_id && item.status) {
              statusMap[item.time_id] = item.status;
            }
          });

          setBookingStatusMap(statusMap);
        } else {
          setBookingStatusMap({});
        }
      } catch (error) {
        console.error("Error checking booking status:", error);
        setBookingStatusMap({});
      }
    };

    checkUserBookingStatus();
  }, [selectedDate, selectedBranch, currentUserId]);

  const getCardStyle = (timeSlotId: number, isSelected: boolean, isFull: boolean) => {
    const bookingStatus = bookingStatusMap[timeSlotId];

    let background = "#ffffff";
    let borderColor = "#d9d9d9";
    let boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

    if (isFull) {
      background = "linear-gradient(135deg, #ffccc7 0%, #ff7875 100%)";
      borderColor = "#ff4d4f";
    } else if (isSelected) {
      background = "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)";
      borderColor = "#1677ff";
      boxShadow = "0 4px 12px rgba(22, 119, 255, 0.3)";
    } else if (bookingStatus === "pending") {
      background = "linear-gradient(135deg, #fff7e6 0%, #ffd666 100%)";
      borderColor = "#faad14";
    } else if (bookingStatus === "success") {
      background = "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)";
      borderColor = "#52c41a";
    }

    return {
      background,
      borderColor,
      boxShadow,
      border: `2px solid ${borderColor}`,
      borderRadius: "12px",
      transition: "all 0.3s ease",
    };
  };

  const getStatusBadge = (timeSlotId: number, available: number) => {
    const bookingStatus = bookingStatusMap[timeSlotId];

    if (available <= 0) {
      return <Badge status="error" text={<Text type="danger"><StopOutlined /> เต็มแล้ว</Text>} />;
    }

    if (bookingStatus === "pending") {
      return <Badge status="warning" text={<Text style={{ color: "#faad14" }}><ExclamationCircleOutlined /> รออนุมัติ</Text>} />;
    }

    if (bookingStatus === "success") {
      return <Badge status="success" text={<Text type="success"><CheckCircleOutlined /> จองแล้ว</Text>} />;
    }

    return <Badge status="success" text={<Text type="success">เหลืออีก {available} ที่</Text>} />;
  };

  const isTimeSlotClickable = (timeSlotId: number, isFull: boolean) => {
    if (isFull) return false;

    const bookingStatus = bookingStatusMap[timeSlotId];
    if (bookingStatus === "pending" || bookingStatus === "success") return false;

    return true;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#faad14';
      case 'success':
        return '#52c41a';
      case 'cancelled':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รออนุมัติ';
      case 'success':
        return 'อนุมัติแล้ว';
      case 'cancelled':
        return 'ยกเลิกแล้ว';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'cancelled':
        return <StopOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const handleError = (error: any) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        setErrorMessage("คุณมีการจองรออนุมัติอยู่แล้ว ไม่สามารถจองใหม่ได้");
        setShowErrorModal(true);
      } else if (status === 500) {
        setErrorMessage("คุณมีการนัดหมายแล้ว จะนัดได้อีกหลังจากผ่านวันนัดหมายนี้ หรือติดต่อเจ้าหน้าที่");
        setShowErrorModal(true);
      } else {
        setErrorMessage("คุณมีการนัดหมายแล้ว จะนัดได้อีกหลังจากผ่านวันนัดหมายนี้ หรือติดต่อเจ้าหน้าที่");
        setShowErrorModal(true);
      }
    } else {
      console.error("Error:", error);
      setErrorMessage("คุณมีการนัดหมายแล้ว จะนัดได้อีกหลังจากผ่านวันนัดหมายนี้ หรือติดต่อเจ้าหน้าที่");
      setShowErrorModal(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTime || !selectedBranch || !selectedDate || !selectedServiceType) {
      message.error("กรุณาเลือกข้อมูลให้ครบถ้วน");
      return;
    }

    const available = slotAvailability[selectedTime] ?? 0;
    if (available <= 0) {
      message.error("ช่วงเวลานี้เต็มแล้ว");
      return;
    }

    const bookingStatus = bookingStatusMap[selectedTime];
    if (bookingStatus === "pending") {
      message.error("คุณมีการจองรออนุมัติสำหรับช่วงเวลานี้อยู่แล้ว");
      return;
    }
    if (bookingStatus === "success") {
      message.error("คุณมีการจองที่ได้รับอนุมัติสำหรับช่วงเวลานี้แล้ว");
      return;
    }

    setBookingDetails({
      date_booking: selectedDate,
      time_id: selectedTime,
      branch_id: selectedBranch,
      service_type_id: selectedServiceType,
      user_id: currentUserId,
    });
    setConfirmationVisible(true);
  };

  const confirmBooking = async () => {
    if (!bookingDetails) return;

    setLoading(true);

    try {
      const res = await CreateBooking(bookingDetails);

      if (res.status === 200 || res.status === 201) {
        message.success("ส่งคำขอจองสำเร็จ! รอการอนุมัติ");
        setSelectedTime(null);

        // Refresh user bookings
        await fetchUserBookings();

        const bookingsResponse = await GetBookingStatus(
          currentUserId,
          selectedBranch!,
          selectedDate!
        );

        if (Array.isArray(bookingsResponse)) {
          const statusMap: Record<number, string> = {};
          bookingsResponse.forEach((item: any) => {
            if (item.time_id && item.status) {
              statusMap[item.time_id] = item.status;
            }
          });
          setBookingStatusMap(statusMap);
        }

      } else {
        handleError(res);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setConfirmationVisible(false);
    }
  };

  return (
    <div className="regis-land-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>📅 ระบบจองออนไลน์</span>
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">จองการติดต่อกรมที่ดิน</span>
          </h1>
          <p className="hero-subtitle">
            บริการจองนัดหมายออนไลน์สำหรับการตรวจสอบเอกสารสิทธิ์ที่ดิน
            <br />
            การโอนกรรมสิทธิ์ และการนำที่ดินขึ้น Blockchain
          </p>
        </div>
      </div>

      <div className="main-container" style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header Section - สร้างเป็น modern card */}
        <div className="glass-card" style={{ marginBottom: 32 }}>
          <div className="card-glow"></div>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div className="service-icon">
                <EnvironmentOutlined style={{ fontSize: "2rem", color: "white" }} />
              </div>
              <Title level={2} style={{ color: "var(--primary-dark)", marginBottom: 0, fontSize: "2rem" }}>
                เลือกบริการและสาขา
              </Title>
            </div>
            <Paragraph style={{ color: "var(--primary-medium)", fontSize: "1.1rem", margin: 0 }}>
              เลือกประเภทบริการและสาขาที่ต้องการใช้บริการ
            </Paragraph>
          </div>
        </div>

        <Row gutter={24}>
          {/* Left Column - Booking Form */}
          <Col xs={24} lg={16}>
            {/* Selection Form */}
            <div className="glass-card" style={{ marginBottom: 32 }}>
              <div className="card-glow"></div>
              <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                  <div className="form-icon">
                    <FileTextOutlined style={{ fontSize: "1.5rem", color: "white" }} />
                  </div>
                  <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--primary-dark)" }}>เลือกข้อมูลการจอง</span>
                </div>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      <EnvironmentOutlined style={{ color: "#1677ff", marginRight: 4 }} />
                      จังหวัด
                    </Text>
                    <Select
                      placeholder="เลือกจังหวัด"
                      style={{ width: "100%" }}
                      size="large"
                      className="modern-select"
                      onChange={(val) => {
                        setSelectedProvince(val);
                        setSelectedBranch(null);
                        setSelectedServiceType(null);
                        setBookingStatusMap({});
                      }}
                    >
                      {provinces.map((p) => (
                        <Option key={p.ID} value={p.ID}>{p.name_th}</Option>
                      ))}
                    </Select>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      <EnvironmentOutlined style={{ color: "#1677ff", marginRight: 4 }} />
                      สาขา
                    </Text>
                    <Select
                      placeholder="เลือกสาขา"
                      style={{ width: "100%" }}
                      size="large"
                      className="modern-select"
                      value={selectedBranch || undefined}
                      onChange={(val) => {
                        setSelectedBranch(val);
                        setSelectedServiceType(null);
                        setBookingStatusMap({});
                      }}
                      disabled={!selectedProvince}
                    >
                      {branches.map((b) => (
                        <Option key={b.ID} value={b.ID}>{b.Branch}</Option>
                      ))}
                    </Select>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      <FileTextOutlined style={{ color: "#1677ff", marginRight: 4 }} />
                      ประเภทบริการ
                    </Text>
                    <Select
                      placeholder="เลือกประเภทบริการ"
                      style={{ width: "100%" }}
                      size="large"
                      className="modern-select"
                      onChange={(val) => setSelectedServiceType(val)}
                      disabled={!selectedBranch}
                    >
                      {serviceTypes.map((service) => (
                        <Option key={service.ID} value={service.ID}>{service.service}</Option>
                      ))}
                    </Select>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      <CalendarOutlined style={{ color: "#1677ff", marginRight: 4 }} />
                      วันที่
                    </Text>
                    <DatePicker
                      placeholder="เลือกวันที่"
                      style={{ width: "100%" }}
                      size="large"
                      className="modern-datepicker"
                      disabledDate={(current) => {
                        return current && current <= dayjs().endOf('day');
                      }}
                      onChange={(date) => {
                        setSelectedDate(date ? dayjs(date).format("YYYY-MM-DD") : null);
                      }}
                    />
                  </Col>
                </Row>
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && selectedBranch && (
              <div className="glass-card" style={{ marginBottom: 32 }}>
                <div className="card-glow"></div>
                <div style={{ padding: "2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                    <div className="form-icon">
                      <ClockCircleOutlined style={{ fontSize: "1.5rem", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--primary-dark)" }}>
                      เลือกช่วงเวลา
                    </span>
                    <Badge count={`${dayjs(selectedDate).format('DD/MM/YYYY')}`} style={{ backgroundColor: 'var(--primary-light)' }} />
                  </div>
                  <Row gutter={[16, 16]}>
                    {times.map((timeSlot) => {
                      const available = slotAvailability[timeSlot.ID] ?? 5;
                      const isFull = available <= 0;
                      const isClickable = isTimeSlotClickable(timeSlot.ID, isFull);
                      const isSelected = selectedTime === timeSlot.ID;

                      return (
                        <Col key={timeSlot.ID} xs={24} sm={12} md={8} lg={6}>
                          <div
                            className={`time-slot-card ${isSelected ? 'selected' : ''} ${isFull ? 'full' : ''} ${bookingStatusMap[timeSlot.ID] === 'pending' ? 'pending' : ''} ${bookingStatusMap[timeSlot.ID] === 'success' ? 'success' : ''}`}
                            style={{
                              cursor: isClickable ? "pointer" : "not-allowed",
                              opacity: isClickable ? 1 : 0.7,
                              height: "120px"
                            }}
                            onClick={() => {
                              if (isClickable) setSelectedTime(timeSlot.ID);
                            }}
                          >
                            <Title level={4} style={{ margin: "0 0 8px 0", color: "var(--primary-dark)" }}>
                              <ClockCircleOutlined style={{ marginRight: 6, color: "var(--primary-light)" }} />
                              {timeSlot.Timework}
                            </Title>
                            {getStatusBadge(timeSlot.ID, available)}
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="glass-card" style={{ textAlign: "center" }}>
              <div className="card-glow"></div>
              <div style={{ padding: "2rem" }}>
                {loading ? (
                  <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                ) : (
                  <button
                    className="btn-modern"
                    onClick={handleSubmit}
                    disabled={!selectedTime || !selectedBranch || !selectedDate || !selectedServiceType}
                  >
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    ยืนยันการจอง
                  </button>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="glass-card" style={{ marginTop: 24 }}>
              <div className="card-glow"></div>
              <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                  <div className="form-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--primary-dark)" }}>คำอธิบายสถานะ</span>
                </div>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={8}>
                    <Space>
                      <div style={{ width: 16, height: 16, background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)", border: "2px solid #d9d9d9", borderRadius: 4 }}></div>
                      <Text>ช่วงเวลาว่าง</Text>
                    </Space>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Space>
                      <div style={{ width: 16, height: 16, background: "linear-gradient(135deg, #fff7e6 0%, #ffd666 100%)", border: "2px solid #faad14", borderRadius: 4 }}></div>
                      <Text>รออนุมัติ</Text>
                    </Space>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Space>
                      <div style={{ width: 16, height: 16, background: "linear-gradient(135deg, #ffccc7 0%, #ff7875 100%)", border: "2px solid #ff4d4f", borderRadius: 4 }}></div>
                      <Text>จองแล้ว/เต็มแล้ว</Text>
                    </Space>
                  </Col>
                </Row>

                <Divider />

                <Paragraph type="secondary" style={{ textAlign: "center", margin: 0 }}>
                  <strong>หมายเหตุ:</strong> ระบบจำกัดจำนวนการจองไม่เกิน 5 คนต่อช่วงเวลา |
                  ท่านสามารถจองได้เฉพาะวันที่ในอนาคตเท่านั้น
                </Paragraph>
              </div>
            </div>
          </Col>

          {/* Right Column - User Bookings History */}
          <Col xs={24} lg={8}>
            <div className="glass-card" style={{
              height: "fit-content",
              position: "sticky",
              top: "24px"
            }}>
              <div className="card-glow"></div>
              <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className="form-icon">
                      <HistoryOutlined style={{ fontSize: "1.5rem", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--primary-dark)" }}>ประวัติการจองของคุณ</span>
                    <Badge count={userBookings.length} style={{ backgroundColor: 'var(--primary-light)' }} />
                  </div>
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    loading={loadingBookings}
                    onClick={fetchUserBookings}
                    size="small"
                  >
                    รีเฟรช
                  </Button>
                </div>
                {loadingBookings ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin size="large" />
                    <Text style={{ display: "block", marginTop: 16 }}>กำลังโหลดข้อมูล...</Text>
                  </div>
                ) : userBookings.length === 0 ? (
                  <Empty
                    description="ไม่พบประวัติการจอง"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: "40px 0" }}
                  >
                    <Text type="secondary">คุณยังไม่เคยทำการจองมาก่อน</Text>
                  </Empty>
                ) : (
                  <Timeline
                    mode="left"
                    items={userBookings
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((booking) => ({
                        dot: getStatusIcon(booking.status),
                        color: getStatusColor(booking.status),
                        children: (
                          <Card
                            size="small"
                            style={{
                              marginBottom: 16,
                              borderRadius: "8px",
                              border: `1px solid ${getStatusColor(booking.status)}`,
                              backgroundColor: booking.status === 'pending'
                                ? '#fff7e6'
                                : booking.status === 'success'
                                  ? '#f6ffed'
                                  : '#fff2f0'
                            }}
                            bodyStyle={{ padding: "12px" }}
                          >
                            <div style={{ marginBottom: 8 }}>
                              <Badge
                                color={getStatusColor(booking.status)}
                                text={
                                  <Text strong style={{ color: getStatusColor(booking.status) }}>
                                    {getStatusText(booking.status)}
                                  </Text>
                                }
                              />
                            </div>

                            <Space direction="vertical" size={4} style={{ width: "100%" }}>
                              <div>
                                <CalendarOutlined style={{ color: "#1677ff", marginRight: 6 }} />
                                <Text strong>
                                  {dayjs(booking.date_booking).format('DD/MM/YYYY')}
                                </Text>
                              </div>

                              <div>
                                <ClockCircleOutlined style={{ color: "#52c41a", marginRight: 6 }} />
                                <Text>{booking.timework}</Text>
                              </div>

                              <div>
                                <EnvironmentOutlined style={{ color: "#722ed1", marginRight: 6 }} />
                                <Text>{booking.branch}, {booking.province}</Text>
                              </div>
                            </Space>

                            <Divider style={{ margin: "8px 0" }} />

                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              จองเมื่อ: {dayjs(booking.created_at).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </Card>
                        )
                      }))}
                  />
                )}
              </div>
            </div>

            {/* Booking Statistics Card */}

          </Col>
        </Row>
      </div>

      {/* Modals */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: "#1677ff" }} />
            <span>ยืนยันการจอง</span>
          </Space>
        }
        visible={confirmationVisible}
        onOk={confirmBooking}
        onCancel={() => setConfirmationVisible(false)}
        okText="ยืนยันการจอง"
        cancelText="ยกเลิก"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg, #1677ff 0%, #722ed1 100%)",
            border: "none"
          }
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Paragraph><strong>กรุณาตรวจสอบข้อมูลการจองของท่าน:</strong></Paragraph>
          <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, marginTop: 16 }}>
            <Row gutter={[0, 8]}>
              <Col span={24}>
                <Text strong><CalendarOutlined /> วันที่: </Text>
                <Text>{dayjs(selectedDate).format('DD/MM/YYYY (dddd)')}</Text>
              </Col>
              <Col span={24}>
                <Text strong><ClockCircleOutlined /> ช่วงเวลา: </Text>
                <Text>{times.find((t) => t.ID === selectedTime)?.Timework}</Text>
              </Col>
              <Col span={24}>
                <Text strong><FileTextOutlined /> ประเภทบริการ: </Text>
                <Text>{serviceTypes.find((s) => s.ID === selectedServiceType)?.service}</Text>
              </Col>
              <Col span={24}>
                <Text strong><EnvironmentOutlined /> สาขา: </Text>
                <Text>{branches.find((b) => b.ID === selectedBranch)?.Branch}</Text>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
            <span style={{ color: "#ff4d4f" }}>ไม่สามารถจองได้</span>
          </Space>
        }
        visible={showErrorModal}
        onOk={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
        okText="รับทราบ"
        okButtonProps={{ danger: true }}
      >
        <Paragraph style={{ fontSize: "1.1rem", marginTop: 16 }}>{errorMessage}</Paragraph>
      </Modal>

    </div>
  );
};

export default BookingCalendar;