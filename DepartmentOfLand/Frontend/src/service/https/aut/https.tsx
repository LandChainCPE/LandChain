const apiUrl = import.meta.env.VITE_URL_Backend;

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  const tokenType = sessionStorage.getItem("token_type");
  return {
    "Authorization": `${tokenType} ${token}`,
    "Content-Type": "application/json",
  };
}

async function getQueueByDate() {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/getbookingdata`, requestOptions)
    const result = await response.json();
    return { response, result };
};



async function getDataUserForVerify(bookingID: number) {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/getdatauserforverify/${bookingID}`, requestOptions)
    const result = await response.json();
    return { response, result };
};

async function VerifyWalletID(bookingID: any) {
    const requestOptions = {
        method: "POST",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/verifywalletid/${bookingID}`, requestOptions)
    const result = await response.json();
    return { response, result };
};

async function VerifyLandTitle(LandtitleID: any) {
    const requestOptions = {
        method: "POST",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/verifylandtitleid/${LandtitleID}`, requestOptions)
    const result = await response.json();
    return { response, result };
};



async function getAllLandData() {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/getalllanddata`, requestOptions)
    const result = await response.json();
    return { response, result };
};

async function getTransactionLand() {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/gettransactionland`, requestOptions)
    const result = await response.json();
    // console.log(response);
    // console.log(result);

    return { result };
};



async function DepartmentOfLandVerifyTransaction(transaction_id: number) {
    const requestOptions = {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ transaction_id }),
    };

    let response = await fetch(`${apiUrl}/departmentoflandverifytransaction`, requestOptions);
    const result = await response.json();

    return { response, result };
};


async function GetCountDataDashboardOnchain() {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/getcountdatadashboardonchain`, requestOptions)
    const result = await response.json();
    console.log(response);
    console.log(result);

    return { result };
};

export {
    getQueueByDate,
    getDataUserForVerify,
    VerifyLandTitle,
    VerifyWalletID,
    getAllLandData,
    getTransactionLand,
    DepartmentOfLandVerifyTransaction,
    GetCountDataDashboardOnchain
}