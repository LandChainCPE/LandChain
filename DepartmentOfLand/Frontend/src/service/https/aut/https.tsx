const apiUrl = "http://172.20.10.2:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
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


export {
    getQueueByDate,
    getDataUserForVerify,
    VerifyWalletID
}