// const apiUrl = "https://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io";
const apiUrl = "http://localhost:8080";
function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  const tokenType = sessionStorage.getItem("token_type");
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

// async function GetAllPetition() {
//   const res = await fetch(`${apiUrl}/petitions`, getRequestOptions());
//   return await res.json();
// }

async function GetAllPetition() {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/petitions`, requestOptions)
    const result = await response.json();
    //console.log("result", result);
    return { response, result };
};


async function GetAllStates() {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/states`, requestOptions)
    const result = await response.json();
    console.log("GetAllStates", result);
    return { response, result };
};


async function UpdatePetitionStatus(id: string | number, state_id: number) {
  const requestOptions = {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, state_id }),
  };
  console.log("id", id);
  console.log("state_id", state_id);

  let response = await fetch(`${apiUrl}/updatepetitions`, requestOptions);
  const result = await response.json();
  return { response, result };
};

export {
  getQueueByDate,
  GetAllPetition,
  UpdatePetitionStatus,
  GetAllStates,
};