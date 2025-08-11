const apiUrl = "http://localhost:8080";


function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");
    return {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    };
}


async function CreateAccount(DataCreateAccount: any) {
  const requestOptions: RequestInit = {
    method: "POST",
    body: JSON.stringify(DataCreateAccount),
  };
  const response = await fetch(`${apiUrl}/createaccount`, requestOptions);
  const result = await response.json();
  return {result, response};
  
}
  

export {
  CreateAccount,
};