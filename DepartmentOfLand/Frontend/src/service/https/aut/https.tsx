const apiUrl = import.meta.env.VITE_API_URL;

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

    let res = await fetch(`${apiUrl}/getbookingdata`, requestOptions) 
        .then((res) => {
        if (res.status == 200) {
            return res.json();
        } else {
            return false;
        }
        });
    return res;
};


async function getDataUserForVerify(bookingID: any) {
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

    return { result };
};


export {
    getQueueByDate,
    getDataUserForVerify,
    VerifyLandTitle,
    VerifyWalletID,
    getAllLandData,
    getTransactionLand,
    DepartmentOfLandVerifyTransaction
}