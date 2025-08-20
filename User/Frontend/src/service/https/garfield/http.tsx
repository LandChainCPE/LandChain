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

// ฟังก์ชัน Login ผ่าน Metamask
async function LoginWallet(walletAddress: string) {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metamaskaddress: walletAddress}),
  };

  const response = await fetch(`${apiUrl}/login`, requestOptions);
  const result = await response.json();

  if (result.success && result.exists) {
    // เก็บข้อมูลลง localStorage
    localStorage.setItem("walletAddress", walletAddress);
    localStorage.setItem("token", result.token || "");
    localStorage.setItem("token_type", "Bearer");
    localStorage.setItem("firstName", result.first_name || "");
    localStorage.setItem("lastName", result.last_name || "");
  }

  return { result, response };
}

// ฟังก์ชัน Logout
function LogoutWallet() {
  localStorage.removeItem("walletAddress");
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
}

  

export {
  getAuthHeaders,
  CreateAccount,
  LoginWallet,
  LogoutWallet
};