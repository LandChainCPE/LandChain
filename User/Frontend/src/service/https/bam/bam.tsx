import axios from "axios";

const apiUrl = "http://localhost:8080";

// สร้าง instance ของ axios
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// เพิ่ม Authorization header ในทุกคำขอ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type") || "Bearer";

    if (!config.headers) config.headers = {};

    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// เพิ่ม response interceptor เพื่อจัดการ error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ฟังก์ชันดึงข้อมูลผู้ใช้จาก token
export async function GetInfoUserByToken() {
  try {
    const res = await api.get("/user/info"); // axios จะใช้ header ที่ตั้งไว้ใน interceptor อัตโนมัติ
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

// ฟังก์ชันอื่น ๆ ก็ใช้ axios instance นี้ได้เช่นกัน
export async function GetInfoUserByUserID(id: number) {
  try {
    const res = await api.get(`/user/info/${id}`);
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetLandInfoByTokenID(id: string) {
  try {
    const res = await api.get(`/user/landinfo/${id}`);
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetLandTitleInfoByWallet() {
  try {
    const res = await api.get(`/user/lands`);
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetLandMetadataByToken(tokenID: string) {
  try {
    const res = await api.post("/user/lands/metadata", { tokenID });
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}