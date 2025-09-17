import axios from "axios";

const apiUrl = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Authorization": `${tokenType} ${token}`,
    "Content-Type": "application/json",
  };
}

function getRequestOptions() {
  return { headers: getAuthHeaders() };
}

// ดึง Queue ตามวันที่ (ถ้าจะใช้จริงอาจต้องใส่พารามิเตอร์ date ด้วย)
async function getQueueByDate() {
  return await axios
    .get(`${apiUrl}/queue`, getRequestOptions())
    .then((res) => res.data)
    .catch((e) => e.response);
}

// ดึงรายการคำร้อง
async function GetAllPetition() {
  return await axios
    .get(`${apiUrl}/petitions`, getRequestOptions())
    .then((res) => res.data)
    .catch((e) => e.response);
}

// อัปเดตคำร้องทั้งหมด
async function UpdatePetition(id: string, data: any) {
  return await axios
    .put(`${apiUrl}/petitions/${id}`, data, getRequestOptions())
    .then((res) => res.data)
    .catch((e) => e.response);
}

// อัปเดตเฉพาะสถานะ
async function UpdatePetitionState(id: string, state_id: number) {
  return await axios
    .patch(`${apiUrl}/petitions/${id}/state`, { state_id }, getRequestOptions())
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetAllStates() {
  return await axios
    .get(`${apiUrl}/states`, getRequestOptions())
    .then((res) => res.data)
    .catch((e) => e.response);
}

export { 
  getQueueByDate,
  GetAllPetition, 
  UpdatePetition, 
  UpdatePetitionState,
  GetAllStates,
};
