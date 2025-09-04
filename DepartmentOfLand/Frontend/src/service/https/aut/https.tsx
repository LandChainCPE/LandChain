const apiUrl = "http://localhost:8080";


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
}

export {
    getQueueByDate,
}