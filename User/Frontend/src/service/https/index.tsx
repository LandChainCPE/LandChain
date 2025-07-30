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
}