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



export {
    CreateBooking,
}