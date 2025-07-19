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



export {
    CreateBooking,
    GetProvinces,
    GetBranches,
    GetTimeSlots
}