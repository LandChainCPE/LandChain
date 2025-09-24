
const apiUrl = "http://localhost:8080";

import axios from "axios";
import type { BookingInterface } from "../../../interfaces/Booking";
import type { AvailableSlotsResponse } from "../../../interfaces/types";

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  const tokenType = sessionStorage.getItem("token_type");
  return {
    "Authorization": `${tokenType} ${token}`,
    "Content-Type": "application/json",
  };
}

// 🔧 แก้ไข: สร้าง axios instance ที่มี interceptor
const api = axios.create({
  baseURL: apiUrl,
});

// เพิ่ม Authorization header ในทุกคำขอ
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    const tokenType = sessionStorage.getItem("token_type") || "Bearer";

    // ตรวจสอบว่า headers มีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// เพิ่ม response interceptor เพื่อจัดการ error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง - redirect to login
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("token_type");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 🔧 แก้ไข: ใช้ api instance แทน axios โดยตรง
async function CreateBooking(data: BookingInterface) {
  try {
    const res = await api.post("/userbookings", data);
    return res;
  } catch (error: any) {
    console.error("CreateBooking Error:", error);
    return error.response;
  }
}

export async function getAllPostData() {
  try {
    const res = await api.get("/user/sellpost");
    return res.data;
  } catch (e: any) {
    console.error("getAllPostData Error:", e);
    if (e.response) return e.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

async function GetProvinces() {
  try {
    const res = await api.get("/provinces");
    return res.data;
  } catch (e: any) {
    console.error("GetProvinces Error:", e);
    return e.response?.data || { error: "ไม่สามารถดึงข้อมูลจังหวัดได้" };
  }
}

async function GetTimeSlots() {
  try {
    const res = await api.get("/time");
    return res.data;
  } catch (e: any) {
    console.error("GetTimeSlots Error:", e);
    return e.response?.data || { error: "ไม่สามารถดึงข้อมูลช่วงเวลาได้" };
  }
}

async function GetBranches() {
  try {
    const res = await api.get("/branches");
    return res.data;
  } catch (e: any) {
    console.error("GetBranches Error:", e);
    return e.response?.data || { error: "ไม่สามารถดึงข้อมูลสาขาได้" };
  }
}

export async function GetSuccessfulBookingsByDateAndBranch(date: string, branchID: number) {
  try {
    const response = await api.get("/bookings", {
      params: {
        date: date,
        branchID: branchID,
      },
    });

    // กรองเฉพาะ booking ที่ status = "success"
    const filtered = (response.data as any[]).filter(b => b.status === 'success');

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
  try {
    const res = await api.get("/service-types");
    return res.data;
  } catch (e: any) {
    console.error("GetServiceTypes Error:", e);
    return e.response?.data || { error: "ไม่สามารถดึงข้อมูลประเภทบริการได้" };
  }
}

export async function GetAvailableSlots(
  date: string,
  branchID: number,
  timeID: number
): Promise<AvailableSlotsResponse> {
  try {
    const { data } = await api.get<AvailableSlotsResponse>("/bookings/checklim", {
      params: { date, branchID, timeID },
    });
    return data;
  } catch (err) {
    console.error("Error checking available slots:", err);
    return { available_slots: 0, total_bookings: 0 };
  }
}

export const GetBookingStatus = async (
  userID: number, branchID: number, date: string) => {
  try {
    const response = await api.get("/bookings/status", {
      params: {
        userID: userID,
        branchID: branchID,
        date: date,
      },
    });

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Error: Response is not an array", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error checking booking status:", error);
    return [];
  }
};

export const checkBookingStatus = async (
  userID: number,
  branchID: number,
  date: string,
  timeID?: number
) => {
  try {
    const params: any = {
      userID: userID,
      branchID: branchID,
      date: date,
    };

    if (timeID && timeID !== 0) {
      params.time_id = timeID;
    }

    const response = await api.get("/bookings/status", {
      params: params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching booking status:", error);
    throw new Error("ไม่สามารถดึงข้อมูลการจองได้");
  }
};

export async function GetAllLandDatabyID() {
  try {
    const res = await api.get("/user/chat/:id");
    return res.data;
  } catch (e: any) {
    console.error("GetAllLandDatabyID Error:", e);
    if (e.response) return e.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetMessagesByLandPostID(id: string) {
  try {
    const res = await api.get(`/user/chat/roomchat/${id}`);
    return res.data;
  } catch (e: any) {
    console.error("GetMessagesByLandPostID Error:", e);
    if (e.response) return e.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export const GetUserBookings = async (userID: number) => {
  try {
    const response = await api.get(`/bookings/${userID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw new Error("ไม่สามารถดึงข้อมูลการจองได้");
  }
};

// 🔧 เพิ่ม utility function สำหรับตรวจสอบ token
export const isTokenValid = (): boolean => {
  const token = sessionStorage.getItem("token");
  return !!token;
};

// 🔧 เพิ่ม function สำหรับ logout
export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("token_type");
  window.location.href = "/login";
};

// ใช้ instance api แทนที่จะเรียก apiUrl ตรง ๆ
export const createLocation = async (latitude: number, longitude: number, landsalepostId: number) => {
  const response = await api.post('/location', {
    latitude,
    longitude,
    landsalepost_id: landsalepostId,
  });
  return response.data;
};

// 🔧 แก้ไข: ใช้ api instance แทน axios โดยตรง และเพิ่ม error handling
export async function getAllLocations() {
  try {
    const response = await api.get("/locations");
    console.log("getAllLocations API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all locations:", error);

    // ส่งกลับข้อมูลที่มีรูปแบบเดียวกัน
    if (error.response) {
      return error.response.data;
    } else {
      return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
    }
  }
}

// 🔧 เพิ่ม function สำหรับ get locations by land sale post id
export async function getLocationsByLandSalePostId(landsalepostId: number) {
  try {
    const response = await api.get(`/locations/${landsalepostId}`);
    console.log(`getLocationsByLandSalePostId(${landsalepostId}) API Response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching locations by land sale post id:", error);

    if (error.response) {
      return error.response.data;
    } else {
      return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
    }
  }
}


async function CheckVerifyWallet(wallet: any) {
  const requestOptions = {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ wallet }),
  };

  let response = await fetch(`${apiUrl}/checkverifywallet`, requestOptions);
  const result = await response.json();
  return { response, result };
};

// แก้ไข updatePost function ใน index.tsx
// แก้ไข updatePost function ใน index.tsx
export async function updatePost(data: any) {
  try {
    // Debug log เพื่อตรวจสอบข้อมูลที่ได้รับ
    console.log('updatePost received data:', data);
    console.log('data.id:', data.id);
    
    if (!data.id) {
      console.error('Post ID is missing from data:', data);
      return { response: { ok: false }, result: { error: "Post ID is required" } };
    }

    const requestData = {
      post_id: data.id, // ส่ง post_id ใน body
      name: data.name,
      price: data.price,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      province_id: data.province_id,
      district_id: data.district_id,
      subdistrict_id: data.subdistrict_id,
      land_id: data.land_id,
      user_id: data.user_id,
    };

    console.log('Sending updatePost request with post_id:', requestData);

    // ส่ง PUT request ไปยัง /user/updatepost (ไม่ใส่ post_id ใน URL)
    const response = await api.put('/user/updatepost', requestData);
    console.log('UpdatePost API Response:', response);
    
    if (response.status === 200) {
      return { response: { ok: true }, result: response.data };
    } else {
      return { response: { ok: false }, result: { error: "เกิดข้อผิดพลาดในการแก้ไขโพสต์" } };
    }
  } catch (error: any) {
    console.error("updatePost Error:", error);
    if (error.response) {
      return { response: { ok: false }, result: error.response.data };
    } else {
      return { response: { ok: false }, result: { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" } };
    }
  }
}

async function updateLocation(location_id: number, data: any) {
  const requestOptions = {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  };
  let response = await fetch(`${apiUrl}/user/location/${location_id}`, requestOptions);
  const result = await response.json();
  return { response, result };
  
}


async function updatePhotoland(photoland_id: number, data: any) {
  const requestOptions = {
    method: "PUT",  
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  };
  let response = await fetch(`${apiUrl}/user/photoland/${photoland_id}`, requestOptions);
  const result = await response.json();
  return { response, result };
}

async function GetUserPostLandData (wallet: string) {
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };
  let response = await fetch(`${apiUrl}/user/lands/${wallet}`, requestOptions);
  const result = await response.json();
  return { response, result };
  console.log("555555",response);
}

export {
  CreateBooking,
  GetProvinces,
  GetBranches,
  GetTimeSlots,
  GetServiceTypes,
  CheckVerifyWallet,
  GetUserPostLandData,
  updateLocation,
  updatePhotoland
};