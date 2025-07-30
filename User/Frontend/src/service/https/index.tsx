const apiUrl = "http://localhost:8080";
import axios from "axios";
import type { BookingInterface } from "../../interfaces/Booking";



const requestOptions = {
  headers: {
    "Content-Type": "application/json",
  },
};

async function CreateBooking(data: BookingInterface) {
  return await axios
    .post(`${apiUrl}/userbookings`, data, requestOptions)
    .then((res) => res) // คืนค่าทั้ง response object
    .catch((e) => e.response); // ถ้า error คืน response error
}

export async function getAllPostData() {
  try {
    const res = await axios.get(`${apiUrl}/user/sellpost`);
    return res.data; // คืนแค่ data
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data; // คืนเฉพาะ error message ถ้ามี
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}
// services/booking/index.tsx
async function GetProvinces(p?: any) {
  return await axios
    .get(`${apiUrl}/provinces`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetTimeSlots(t?: any) {
  return await axios
    .get(`${apiUrl}/time`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetBranches(b?: any) {
  return await axios
    .get(`${apiUrl}/branches`, requestOptions)
    .then((res) => res.data) // คืนค่าข้อมูลสาขา
    .catch((e) => e.response); // ถ้า error คืน response error
}


export async function GetSuccessfulBookingsByDateAndBranch(date: string, branchID: number) {
  try {
    const response = await axios.get(`${apiUrl}/bookings`, {
      params: {
        date: date,
        branchID: branchID,
      },
      ...requestOptions,
    });

    // กรองเฉพาะ booking ที่ status = "success"
    const filtered = response.data.filter((b: any) => b.status === "success");

    // คืนข้อมูลที่จำเป็น
    return filtered.map((b: any) => ({
      timeID: b.time_id,
      date: b.date_booking,
    }));
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

async function GetServiceTypes() {
  return await axios
    .get(`${apiUrl}/service-types`, requestOptions)
    .then((res) => res.data) // คืนค่าข้อมูลประเภทบริการ
    .catch((e) => e.response); // ถ้า error คืน response error
}


export async function GetAvailableSlots(date: string, branchID: number, timeID: number) {
  try {
    const response = await axios.get(`${apiUrl}/bookings/checklim`, {
      params: {
        date: date,
        branchID: branchID,
        timeID: timeID,
      },
    });
    return response.data; // { available_slots: number, total_bookings: number }
  } catch (error: any) {
    console.error("Error checking limit:", error);
    return { available_slots: 0, total_bookings: 0 };
  }
}

export async function GetBookingStatus(id: number, selectedDate: string, selectedBranch: number, selectedServiceType: number) {
  try {
    const response = await axios.get(`${apiUrl}/bookings/status`, {
      params: {
        userID: id,
      },
    });
    return response.data; // เช่น { message: "คุณมีการจองที่รออนุมัติอยู่แล้ว" } หรือ { message: "" }
  } catch (error) {
    console.error("Error checking booking status:", error);
    return { message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะการจอง" }; // ถ้าเกิดข้อผิดพลาด
  }
}


export async function GetAllLandDatabyID() {
  try {
    const res = await axios.get(`${apiUrl}/user/chat/:id`);
    return res.data; // คืนแค่ data
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data; // คืนเฉพาะ error message ถ้ามี
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetMessagesByLandPostID(id: string) {
  try {
    const res = await axios.get(`${apiUrl}/user/chat/roomchat/${id}`);
    return res.data; // คืนแค่ data
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data; // คืนเฉพาะ error message ถ้ามี
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export {
    CreateBooking,
    GetProvinces,
    GetBranches,
    GetTimeSlots,
    GetServiceTypes,
}