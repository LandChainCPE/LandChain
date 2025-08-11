import axios from "axios";

const apiUrl = "http://localhost:8080";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

//ดึงรายการคำร้อง
async function GetAllPetition() {
  return await axios
    .get(`${apiUrl}/petitions`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

//สร้างคำร้องใหม่
async function CreatePetition(data: any) {
  return await axios
    .post(`${apiUrl}/petitions`, data, requestOptions) // ✅ ส่ง data เป็น body
    .then((res) => res.data)
    .catch((e) => e.response);
}

//อัปเดตคำร้องทั้งหมด
async function UpdatePetition(id: string, data: any) {
  return await axios
    .put(`${apiUrl}/petitions/${id}`, data, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

//อัปเดตเฉพาะสถานะ
async function UpdatePetitionState(id: string, state_id: number) {
  return await axios
    .patch(`${apiUrl}/petitions/${id}/state`, { state_id }, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetAllStates() {
  return await axios
    .get(`${apiUrl}/states`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

export { 
  GetAllPetition, 
  CreatePetition, 
  UpdatePetition, 
  UpdatePetitionState,
  GetAllStates,
};
