const apiUrl = "http://localhost:8080";

async function getQueueByDate() {
    const requestOptions = {
        method: "GET",
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