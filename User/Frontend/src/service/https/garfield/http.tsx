const apiUrl = "http://localhost:8080";


function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");
    return {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    };
}


async function CreateAccount(DataCreateAccount: any) {
  const requestOptions: RequestInit = {
    method: "POST",
    body: JSON.stringify(DataCreateAccount),
  };
  const response = await fetch(`${apiUrl}/createaccount`, requestOptions);
  const result = await response.json();
  return {result, response};
  
}

// ฟังก์ชัน Login ผ่าน Metamask
async function LoginWallet(walletAddress: string) {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metamaskaddress: walletAddress}),
  };

  const response = await fetch(`${apiUrl}/login`, requestOptions);
  const result = await response.json();

  if (result.success && result.exists) {
    // เก็บข้อมูลลง localStorage
    localStorage.setItem("walletAddress", walletAddress);
    localStorage.setItem("token", result.token || "");
    localStorage.setItem("token_type", "Bearer");
    localStorage.setItem("firstName", result.first_name || "");
    localStorage.setItem("lastName", result.last_name || "");
  }

  return { result, response };
}

// ฟังก์ชัน Logout
function LogoutWallet() {
  localStorage.removeItem("walletAddress");
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
}

// ฟังก์ชันบันทึกข้อมูลที่ดิน
async function RegisterLand(DataCreateLand: any, imageFile?: File) {
  const formData = new FormData();

  // เพิ่มข้อมูลลง FormData
  Object.entries(DataCreateLand).forEach(([key, value]) => {
    formData.append(key, value as any);
  });

  // เพิ่มไฟล์ภาพถ้ามี
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${apiUrl}/user/userregisland`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(), // ใส่ token สำหรับ auth
      // **ห้ามใส่ Content-Type แบบ JSON เมื่อใช้ FormData**
    },
    body: formData,
  });

  const result = await response.json();
  return { result, response };
}

// ดึงข้อมูลจังหวัด
async function GetAllProvinces() {
  return await axios
    .get(`${apiUrl}/province`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

// ดึงข้อมูลอำเภอ
async function GetDistrict(Id: number) {
  return await axios
    .get(`${apiUrl}/district/${Id}`, requestOptions) // ส่ง path param
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetSubdistrict(Id: number) {
  return await axios
    .get(`${apiUrl}/subdistrict/${Id}`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}


export {
  getAuthHeaders,
  RegisterLand,
  CreateAccount,
  LoginWallet,
  LogoutWallet,
  GetProvinces,
  GetDistricts,
  GetSubdistricts
};