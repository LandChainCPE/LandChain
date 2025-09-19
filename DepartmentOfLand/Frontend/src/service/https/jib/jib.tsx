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

async function UpdatePetition(id: string, data: any) {
  const res = await fetch(`${apiUrl}/petitions/${id}`, getRequestOptions("PUT", data));
  return await res.json();
}

async function UpdatePetitionState(id: string, stateId: number) {
  const res = await fetch(`${apiUrl}/petitions/${id}/state`, getRequestOptions("PATCH", { state_id: stateId }));
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

async function GetAllStates() {
  const res = await fetch(`${apiUrl}/states`, getRequestOptions());
  return await res.json();
}

export {
  getQueueByDate,
  GetAllPetition,
  UpdatePetition,
  UpdatePetitionState,
  GetAllStates,
};