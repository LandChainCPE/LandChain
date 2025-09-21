import axios from "axios";

const apiUrl = "http://10.1.63.218:8080";

/** ใส่เฉพาะ Authorization (อย่าใส่ Content-Type ที่นี่) */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type") || "Bearer";
  return token ? { Authorization: `${tokenType} ${token}` } : {};
}

/** Header สำหรับ JSON โดยเฉพาะ */
function getJsonHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
}

/** axios instance พร้อม baseURL และ auth interceptor */
const api = axios.create({ baseURL: apiUrl });

api.interceptors.request.use((config) => {
  // merge headers แทนการเรียก config.headers?.set(...)
  Object.entries(getAuthHeaders()).forEach(([key, value]) => {
    config.headers?.set(key, value);
  });
  return config;
});

/** สร้างบัญชี (JSON) */
async function CreateAccount(DataCreateAccount: any) {
  const response = await fetch(`${apiUrl}/createaccount`, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(DataCreateAccount),
  });
  const result = await response.json();
  return { result, response };
}

/** Login ด้วย Metamask (JSON) */
async function LoginWallet(walletAddress: string) {
  const response = await fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metamaskaddress: walletAddress }),
  });

  const result = await response.json();

  if (result.success && result.exists) {
    localStorage.setItem("walletAddress", walletAddress);
    localStorage.setItem("token", result.token || "");
    localStorage.setItem("token_type", result.token_type || "Bearer");
    //localStorage.setItem("firstName", result.first_name || "");
    //localStorage.setItem("lastName", result.last_name || "");
    localStorage.setItem("user_id", result.user_id);
    localStorage.setItem("isLogin", "true"); // ✅ ต้องมี
  }

  return { result, response };
}


// ฟังก์ชัน Logout
/** Logout: ลบทุกค่าใน localStorage ที่เกี่ยวข้อง */
function LogoutWallet() {
  localStorage.clear();
  localStorage.removeItem("walletAddress");
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
  localStorage.removeItem("user_id");
  localStorage.removeItem("isLogin");
}

/** บันทึกข้อมูลที่ดิน (multipart/form-data) */
// async function RegisterLand(
//   DataCreateLand: Record<string, any>,
//   imageFile?: File
// ) {
//   const formData = new FormData();
//   Object.entries(DataCreateLand).forEach(([key, value]) => {
//     formData.append(key, value != null ? String(value) : "");
//   });
//   if (imageFile) formData.append("deed_image", imageFile);

//   // debug + ensure header แนบจริง
//   const headers = { ...getAuthHeaders() };
//   console.log("RegisterLand -> auth headers:", headers);

//   try {
//     // ส่ง explicit headers (axios จะไม่ override multipart Content-Type)
//     const res = await api.post("/user/userregisland", formData, { headers });
//     return { result: res.data, response: res };
//   } catch (err: any) {
//     const resp = err?.response;
//     let result: any = null;
//     try { result = resp?.data ?? null } catch { result = null }
//     return { result, response: resp ?? err };
//   }
// }


async function RegisterLand(payload: any) {
  const requestOptions = {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(payload),
  };

  const response = await fetch(`${apiUrl}/user/userregisland`, requestOptions);
  const result = await response.json();
  return { response, result };
}


/** ดึงจังหวัด (รองรับ AbortSignal) */
async function GetAllProvinces(signal?: AbortSignal) {
  return await api
    .get("/province", { signal })
    .then((res) => res.data)
    .catch((e) => e.response);
}

/** ดึงอำเภอตาม province id */
async function GetDistrict(provinceId: number, signal?: AbortSignal) {
  try {
    const resA = await api.get(`/district/${provinceId}`, { signal });
    if (Array.isArray(resA.data) && resA.data.length) return resA.data;
    if (Array.isArray(resA.data?.result) && resA.data.result.length) return resA.data.result;
  } catch (_) { }

  const resB = await api.get(`/district`, { params: { province_id: provinceId }, signal });
  const dataB = resB.data;
  if (Array.isArray(dataB)) return dataB;
  if (Array.isArray(dataB?.result)) return dataB.result;
  if (Array.isArray(dataB?.data)) return dataB.data;
  return [];
}

/** ดึงตำบลตาม district id */
async function GetSubdistrict(districtId: number, signal?: AbortSignal) {
  try {
    const resA = await api.get(`/subdistrict/${districtId}`, { signal });
    if (Array.isArray(resA.data) && resA.data.length) return resA.data;
    if (Array.isArray(resA.data?.result) && resA.data.result.length) return resA.data.result;
  } catch (_) { }

  const resB = await api.get(`/subdistrict`, { params: { district_id: districtId }, signal });
  const dataB = resB.data;
  if (Array.isArray(dataB)) return dataB;
  if (Array.isArray(dataB?.result)) return dataB.result;
  if (Array.isArray(dataB?.data)) return dataB.data;
  return [];
}


async function GetDataUserVerification(userid: string) {   ///แก้
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  const response = await fetch(`${apiUrl}/getdatauserverification/${userid}`, requestOptions);
  const result = await response.json();
  return { response, result };
}

async function GetUserinfoByID(userId: string) {
  const response = await fetch(`${apiUrl}/userinfo/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const result = await response.json();
  return { response, result };
}

export {
  getAuthHeaders,
  CreateAccount,
  LoginWallet,
  LogoutWallet,
  GetDataUserVerification, ///
  RegisterLand,
  GetAllProvinces,
  GetDistrict,
  GetSubdistrict,
  GetUserinfoByID,
};