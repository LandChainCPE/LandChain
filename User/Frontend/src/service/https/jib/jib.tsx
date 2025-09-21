import axios from "axios";

const apiUrl = "http://10.1.63.218:8080";
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

async function GetAllStates() {
  return await axios
    .get(`${apiUrl}/states`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetAllPostLandData() {
  return await axios
    .get(`${apiUrl}/landposts`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetTags() {
  return await axios
    .get(`${apiUrl}/tags`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
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

async function CreateLandPost(data: any) {
  return await axios
    .post(`${apiUrl}/landpost`, data, requestOptions) // ✅ ส่ง data เป็น body
    .then((res) => res.data)
    .catch((e) => e.response);
}

// ดึง land_id จาก token_id
async function getLandtitleIdByTokenId(tokenId: string) {
  return await axios
    .get(`${apiUrl}/landtitle/by-token/${tokenId}`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function GetPetitionsByUserID(userId: string) {
  return await axios
    .get(`${apiUrl}/petition/${userId}`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function CreateRequestBuySell(data: any) {
  return await axios
    .post(`${apiUrl}/requestbuysell`, data, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}



export { 
  GetAllPetition, 
  CreatePetition, 
  GetAllStates,
  GetAllPostLandData,
  GetTags,
  GetAllProvinces,
  GetDistrict, 
  GetSubdistrict,
  CreateLandPost,
  getLandtitleIdByTokenId,
  GetPetitionsByUserID,
  CreateRequestBuySell,

};
