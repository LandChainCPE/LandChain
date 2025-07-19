import React, { useEffect, useState } from "react";
import { Select, Card, Typography, Spin, message, DatePicker } from "antd";
import { GetBranches, GetProvinces, GetTimeSlots, CreateBooking } from "../../service/https/index";
import type { BookingInterface } from "../../interfaces/Booking";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const apiUrl = "http://localhost:8080";

const BookingCalendar = () => {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [times, setTimes] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<{ timeID: number; date: string }[]>([]);

    useEffect(() => {
        GetProvinces().then(setProvinces);
        GetTimeSlots().then(setTimes);
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            GetBranches().then((data: any) => {
                const filtered = data.filter((b: any) => b.ProvinceID === selectedProvince);
                setBranches(filtered);
            });
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDate && selectedBranch) {
            axios
                .get(`${apiUrl}/bookings?date=${selectedDate}&branchID=${selectedBranch}`)
                .then((res) => {
                    // แปลง date_booking เป็น dayjs และกรองเฉพาะ booking ที่มี status = "success"
                    const successBookings = res.data.filter((b: any) => b.status === "success");
                    setBookedSlots(successBookings.map((b: any) => ({
                        timeID: b.time_id,
                        date: dayjs(b.date_booking).format("YYYY-MM-DD") // แปลง date_booking เป็น dayjs
                    })));
                })
                .catch((error) => {
                    console.error("Error fetching bookings:", error);
                    setBookedSlots([]);
                });
        }
    }, [selectedDate, selectedBranch]);

    const handleSubmit = async () => {
        if (!selectedTime || !selectedBranch || !selectedDate) {
            message.error("กรุณาเลือกวันที่ สาขา และช่วงเวลาให้ครบ");
            return;
        }

        if (isTimeSlotBooked(selectedTime)) {
            message.error("ช่วงเวลานี้ถูกจองแล้ว");
            return;
        }

        setLoading(true);

        try {
            const booking: BookingInterface = {
                date_booking: selectedDate,
                time_id: selectedTime,
                branch_id: selectedBranch,
                user_id: 1, // สมมุติว่าเป็น user_id 1
            };

            const res = await CreateBooking(booking);

            if (res.status === 200 || res.status === 201) {
                message.success("ส่งคำขอจองสำเร็จ! รอการอนุมัติ");
                setSelectedTime(null); // รีเซ็ตการเลือกเวลา
            } else {
                message.error("เกิดข้อผิดพลาดในการจอง");
            }
        } catch (error) {
            console.error("Booking error:", error);
            message.error("เกิดข้อผิดพลาดในการจอง");
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันเช็คว่า time slot มี booking ที่ success แล้วหรือไม่
    const isTimeSlotBooked = (timeID: number) => {
        return bookedSlots.some((b) => b.timeID === timeID && b.date === selectedDate);
    };

    const refreshBookings = () => {
        if (selectedDate && selectedBranch) {
            axios
                .get(`${apiUrl}/bookings?date=${selectedDate}&branchID=${selectedBranch}`)
                .then((res) => {
                    const successBookings = res.data.filter((b: any) => b.status === "success");
                    setBookedSlots(successBookings.map((b: any) => ({
                        timeID: b.time_id,
                        date: dayjs(b.date_booking).format("YYYY-MM-DD") // แปลง date_booking เป็น dayjs
                    })));
                });
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ textAlign: "center" }}>นัดหมายกรมที่ดิน</Title>
            <Text type="secondary" style={{ display: "block", textAlign: "center" }}>
                ตรวจสอบเอกสารสิทธิ์, นำที่ดินขึ้น Blockchain, โอนกรรมสิทธิ์
            </Text>

            <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                <Select
                    placeholder="เลือกจังหวัด"
                    style={{ width: 200 }}
                    onChange={(val) => {
                        setSelectedProvince(val);
                        setSelectedBranch(null);
                    }}
                >
                    {provinces.map((p) => (
                        <Option key={p.ID} value={p.ID}>{p.Province}</Option>
                    ))}
                </Select>

                <Select
                    placeholder="เลือกสาขา"
                    style={{ width: 200 }}
                    value={selectedBranch || undefined}
                    onChange={setSelectedBranch}
                    disabled={!selectedProvince}
                >
                    {branches.map((b) => (
                        <Option key={b.ID} value={b.ID}>{b.Branch}</Option>
                    ))}
                </Select>

                <DatePicker
                    placeholder="เลือกวันที่"
                    style={{ width: 200 }}
                    onChange={(date) => setSelectedDate(date ? dayjs(date).format("YYYY-MM-DD") : null)}
                />

                <button
                    style={{ 
                        padding: "4px 12px", 
                        fontSize: 12, 
                        background: "#f0f0f0", 
                        border: "1px solid #d9d9d9", 
                        borderRadius: 4,
                        cursor: "pointer"
                    }}
                    onClick={refreshBookings}
                    disabled={!selectedDate || !selectedBranch}
                >
                    รีเฟรช
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 32 }}>
                {times.map((timeSlot) => {
                    const isSuccessBooked = isTimeSlotBooked(timeSlot.ID); // เช็คว่ามี booking ที่ success หรือไม่
                    
                    return (
                        <Card
                            key={timeSlot.ID}
                            hoverable={!isSuccessBooked} // ห้ามคลิกถ้าถูกจอง success แล้ว
                            style={{
                                background: isSuccessBooked
                                    ? "#ffccc7" // สีแดงถ้ามี booking success แล้ว
                                    : selectedTime === timeSlot.ID
                                        ? "#e6f7ff" // สีฟ้าเมื่อเลือกแล้ว
                                        : "#fff",   // สีพื้นปกติ
                                cursor: isSuccessBooked ? "not-allowed" : "pointer", // ปิดการคลิกถ้าจอง success แล้ว
                                opacity: isSuccessBooked ? 0.6 : 1, // ลดความทึบถ้าจอง success แล้ว
                            }}
                            onClick={() => {
                                if (!isSuccessBooked) setSelectedTime(timeSlot.ID); // ถ้ายังไม่ถูกจอง success
                            }}
                        >
                            <Text style={{ color: isSuccessBooked ? "red" : "black" }}>
                                {timeSlot.Timework}
                            </Text> {/* เปลี่ยนสีเป็นแดงถ้าถูกจอง */}
                            {isSuccessBooked && <Text type="danger"> (ถูกจองแล้ว)</Text>}
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
                            borderRadius: 8 
                        }}
                        onClick={handleSubmit}
                    >
                        ยืนยันการจอง
                    </button>
                )}
            </div>

            <div style={{ marginTop: 16, textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    หมายเหตุ: ช่วงเวลาสีแดงคือช่วงเวลาที่ถูกจองและอนุมัติแล้ว (Status: Success)
                </Text>
            </div>
        </div>
    );
};

export default BookingCalendar;
