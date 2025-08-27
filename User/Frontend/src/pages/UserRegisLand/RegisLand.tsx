import React, { useEffect, useState } from "react";
import { Select, Card, Typography, Spin, message, DatePicker, Modal } from "antd";
import { GetBranches, GetProvinces, GetTimeSlots, CreateBooking, GetServiceTypes, GetAvailableSlots, GetBookingStatus } from "../../service/https/index";
import type { BookingInterface } from "../../interfaces/Booking";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text } = Typography;
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
  
  // New state for booking status
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [bookingStatusMap, setBookingStatusMap] = useState<Record<number, string>>({});

  const currentUserId = 1; // ใช้ user ID จริงของระบบ

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provincesData = await GetProvinces();
        setProvinces(provincesData);

        const serviceTypesData = await GetServiceTypes();
        setServiceTypes(serviceTypesData);

        const timeSlotsData = await GetTimeSlots();
        setTimes(timeSlotsData);

        if (selectedProvince) {
          const branchesData = await GetBranches();
          const filteredBranches = branchesData.filter((b: any) => b.ProvinceID === selectedProvince);
          setBranches(filteredBranches);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedProvince]);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedDate || !selectedBranch) return;

      const newAvailability: Record<number, number> = {};

      for (const time of times) {
        const res = await GetAvailableSlots(selectedDate, selectedBranch, time.ID);
        newAvailability[time.ID] = res.available_slots;
      }

      setSlotAvailability(newAvailability);
    };

    if (selectedDate && selectedBranch && times.length > 0) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedBranch, times]);

  // New useEffect to check booking status when all required fields are selected
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (!selectedDate || !selectedBranch || !selectedServiceType) {
        setBookingStatusMap({});
        return;
      }

      try {
        const bookingsResponse = await GetBookingStatus(currentUserId, selectedDate, selectedBranch, selectedServiceType);
        setUserBookings(bookingsResponse);

        // Filter bookings that match current selection
        const matchingBookings = bookingsResponse.filter((booking: any) => {
          const bookingDate = dayjs(booking.date_booking).format("YYYY-MM-DD");
          return (
            bookingDate === selectedDate &&
            booking.branch_id === selectedBranch &&
            booking.service_type_id === selectedServiceType
          );
        });

        // Create status map for time slots
        const statusMap: Record<number, string> = {};
        matchingBookings.forEach((booking: any) => {
          statusMap[booking.time_id] = booking.status;
        });

        setBookingStatusMap(statusMap);
      } catch (error) {
        console.error("Error checking booking status:", error);
        setBookingStatusMap({});
      }
    };

    checkBookingStatus();
  }, [selectedDate, selectedBranch, selectedServiceType]);

  // Function to get card background color based on booking status
  const getCardBackground = (timeSlotId: number, isSelected: boolean, isFull: boolean) => {
    if (isFull) return "#ffccc7"; // เต็มแล้ว - สีแดงอ่อน
    if (isSelected) return "#e6f7ff"; // เลือกแล้ว - สีฟ้าอ่อน
    
    const bookingStatus = bookingStatusMap[timeSlotId];
    if (bookingStatus === "pending") return "#fff7e6"; // รออนุมัติ - สีเหลือง
    if (bookingStatus === "success") return "#ffccc7"; // อนุมัติแล้ว - สีแดงอ่อน
    
    return "#fff"; // ปกติ - สีขาว
  };

  // Function to get status text
  const getStatusText = (timeSlotId: number, available: number) => {
    const bookingStatus = bookingStatusMap[timeSlotId];
    
    if (available <= 0) {
      return <Text type="danger">เต็มแล้ว</Text>;
    }
    
    if (bookingStatus === "pending") {
      return <Text style={{ color: "#fa8c16" }}>รออนุมัติ</Text>;
    }
    
    if (bookingStatus === "success") {
      return <Text type="danger">จองแล้ว</Text>;
    }
    
    return <Text type="success">เหลืออีก {available} ที่</Text>;
  };

  // Function to determine if time slot is clickable
  const isTimeSlotClickable = (timeSlotId: number, isFull: boolean) => {
    if (isFull) return false;
    
    const bookingStatus = bookingStatusMap[timeSlotId];
    // ไม่ให้จองซ้ำถ้าอยู่ในสถานะ pending หรือ success
    if (bookingStatus === "pending" || bookingStatus === "success") return false;
    
    return true;
  };

  // Handle errors based on status code
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
      message.error("กรุณาเลือกวันที่ สาขา ประเภทบริการ และช่วงเวลาให้ครบ");
      return;
    }

    const available = slotAvailability[selectedTime] ?? 0;
    if (available <= 0) {
      message.error("ช่วงเวลานี้เต็มแล้ว");
      return;
    }

    // Check if user already has booking for this time slot
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
        
        // Refresh booking status after successful booking
        const bookingsResponse = await GetBookingStatus(
          currentUserId,
          selectedDate!,
          selectedBranch!,
          selectedServiceType!
        );
        setUserBookings(bookingsResponse);
        
        // Update status map
        const matchingBookings = bookingsResponse.filter((booking: any) => {
          const bookingDate = dayjs(booking.date_booking).format("YYYY-MM-DD");
          return (
            bookingDate === selectedDate &&
            booking.branch_id === selectedBranch &&
            booking.service_type_id === selectedServiceType
          );
        });

        const statusMap: Record<number, string> = {};
        matchingBookings.forEach((booking: any) => {
          statusMap[booking.time_id] = booking.status;
        });
        setBookingStatusMap(statusMap);
        
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
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ textAlign: "center" }}>นัดหมายกรมที่ดิน</Title>
      <Text type="secondary" style={{ display: "block", textAlign: "center" }}>
        ตรวจสอบเอกสารสิทธิ์, นำที่ดินขึ้น Blockchain, โอนกรรมสิทธิ์
      </Text>

      <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        <Select placeholder="เลือกจังหวัด" style={{ width: 200 }} onChange={(val) => {
          setSelectedProvince(val);
          setSelectedBranch(null);
          setSelectedServiceType(null);
          setBookingStatusMap({}); // Clear booking status when province changes
        }}>
          {provinces.map((p) => (
            <Option key={p.ID} value={p.ID}>{p.Province}</Option>
          ))}
        </Select>

        <Select placeholder="เลือกสาขา" style={{ width: 200 }} value={selectedBranch || undefined} onChange={(val) => {
          setSelectedBranch(val);
          setSelectedServiceType(null);
          setBookingStatusMap({}); // Clear booking status when branch changes
        }} disabled={!selectedProvince}>
          {branches.map((b) => (
            <Option key={b.ID} value={b.ID}>{b.Branch}</Option>
          ))}
        </Select>

        <Select placeholder="เลือกประเภทบริการ" style={{ width: 200 }} onChange={(val) => {
          setSelectedServiceType(val);
        }} disabled={!selectedBranch}>
          {serviceTypes.map((service) => (
            <Option key={service.ID} value={service.ID}>{service.service}</Option>
          ))}
        </Select>

        <DatePicker placeholder="เลือกวันที่" style={{ width: 200 }} onChange={(date) => {
          setSelectedDate(date ? dayjs(date).format("YYYY-MM-DD") : null);
        }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 32 }}>
        {times.map((timeSlot) => {
          const available = slotAvailability[timeSlot.ID] ?? 5;
          const isFull = available <= 0;
          const isClickable = isTimeSlotClickable(timeSlot.ID, isFull);
          const isSelected = selectedTime === timeSlot.ID;

          return (
            <Card
              key={timeSlot.ID}
              hoverable={isClickable}
              style={{
                background: getCardBackground(timeSlot.ID, isSelected, isFull),
                cursor: isClickable ? "pointer" : "not-allowed",
                opacity: isClickable ? 1 : 0.6,
                border: isSelected ? "2px solid #1677ff" : "1px solid #d9d9d9",
              }}
              onClick={() => {
                if (isClickable) setSelectedTime(timeSlot.ID);
              }}
            >
              <Text strong>{timeSlot.Timework}</Text>
              <br />
              {getStatusText(timeSlot.ID, available)}
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        {loading ? <Spin /> : (
          <button 
            style={{ 
              padding: "8px 24px", 
              fontSize: 16, 
              background: "#1677ff", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              opacity: (!selectedTime || !selectedBranch || !selectedDate || !selectedServiceType) ? 0.6 : 1,
              cursor: (!selectedTime || !selectedBranch || !selectedDate || !selectedServiceType) ? "not-allowed" : "pointer"
            }} 
            onClick={handleSubmit}
            disabled={!selectedTime || !selectedBranch || !selectedDate || !selectedServiceType}
          >
            ยืนยันการจอง
          </button>
        )}
      </div>

      <Modal
        title="ยืนยันการจอง"
        visible={confirmationVisible}
        onOk={confirmBooking}
        onCancel={() => setConfirmationVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <p>คุณต้องการจองเวลานี้จริงหรือไม่?</p>
        <p>วันที่: {selectedDate}</p>
        <p>ช่วงเวลา: {times.find((t) => t.ID === selectedTime)?.Timework}</p>
        <p>ประเภทบริการ: {serviceTypes.find((s) => s.ID === selectedServiceType)?.service}</p>
        <p>สาขา: {branches.find((b) => b.ID === selectedBranch)?.Branch}</p>
      </Modal>

      <Modal
        title="การจองไม่สามารถทำได้"
        visible={showErrorModal}
        onOk={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
        okText="ปิด"
      >
        <p>{errorMessage}</p>
      </Modal>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          หมายเหตุ: ระบบจำกัดจำนวนจองไม่เกิน 5 คนต่อช่วงเวลา
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          สีเหลือง = รออนุมัติ, สีแดง = จองแล้ว/เต็มแล้ว, สีขาว = ว่าง
        </Text>
      </div>
    </div>
  );
};

export default BookingCalendar;