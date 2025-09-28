import axios from "axios";
const apiUrl = "https://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io";

const Authorization = sessionStorage.getItem("token");
const Bearer = sessionStorage.getItem("token_type");

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

// ดึงคำร้องของ user ตาม user_id
async function GetPetitionsByUserID(userId: string) {
  return await axios
    .get(`${apiUrl}/petitions/user/${userId}`, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

async function CreateRequestBuySell(data: any) {
  return await axios
    .post(`${apiUrl}/requestbuysell`, data, requestOptions)
    .then((res) => res.data)
    .catch((e) => e.response);
}

// เช็ค land_id ว่ามีโพสต์ขายแล้วหรือยัง
async function checkLandsalepostByLandId(landId: string) {
  return await axios
    .get(`${apiUrl}/landsalepost/check?land_id=${landId}`, requestOptions)
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
  checkLandsalepostByLandId,

};
