const apiUrl = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Authorization": `${tokenType} ${token}`,
    "Content-Type": "application/json",
  };
}

function getRequestOptions(method = "GET", body?: any) {
  const options: RequestInit = {
    method,
    headers: getAuthHeaders(),
    credentials: "include",
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}

async function getQueueByDate() {
  const res = await fetch(`${apiUrl}/queue`, getRequestOptions());
  return await res.json();
}

async function GetAllPetition() {
  const res = await fetch(`${apiUrl}/petitions`, getRequestOptions());
  return await res.json();
}

async function GetAllStates() {
  const res = await fetch(`${apiUrl}/states`, getRequestOptions());
  return await res.json();
}

// อัปเดตสถานะคำร้อง (admin เปลี่ยนสถานะ)
async function UpdatePetitionStatus(id: string | number, state_id: number) {
  const res = await fetch(
    `${apiUrl}/petitions/${id}/status`,
    getRequestOptions("PUT", { state_id })
  );
  return await res.json();
}

export {
  getQueueByDate,
  GetAllPetition,
  UpdatePetitionStatus,
  GetAllStates,
};