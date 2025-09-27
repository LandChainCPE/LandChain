// Nonce service for handling replay attack prevention
const API_BASE_URL = 'https://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io';

export interface NonceResponse {
  nonce: string;
}

export interface LoginRequest {
  address: string;
  nonce: string;
  signature: string;
}

export interface RegisRequest {
  address: string;
  nonce: string;
  signature: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  token_type: string;
  token: string;
  user_id: number;
  first_name: string;
  last_name: string;
  wallet_address: string;
  success: boolean;
  exists: boolean;
}

// Get nonce for address
export const getNonce = async (address: string): Promise<NonceResponse> => {
  const response = await fetch(`${API_BASE_URL}/nonce/${address}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get nonce: ${response.statusText}`);
  }
  
  return response.json();
};

// Login with nonce and signature
export const loginWithNonce = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }
  
  return result;
};


export const RegisWithNonce = async (loginData: RegisRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Register failed');
  }
  
  return result;
};



// Sign message with MetaMask
export const signMessage = async (message: string, address: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  });
  
  return signature;
};

// Complete login flow with nonce protection
export const secureLogin = async (address: string): Promise<LoginResponse> => {
  try {
    // Step 1: Get nonce
    const { nonce } = await getNonce(address);
    console.log("Received nonce:", nonce);
    
    // Step 2: Sign nonce
    const signature = await signMessage(nonce, address);
    console.log("Signature:", signature);
    
    // Step 3: Login with nonce and signature
    const loginResult = await loginWithNonce({
      address,
      nonce,
      signature,
    });
    
    return loginResult;
  } catch (error) {
    console.error('Secure login failed:', error);
    throw error;
  }
};



export const secureRegis = async (address: string): Promise<LoginResponse> => {
  try {
    // Step 1: Get nonce
    const { nonce } = await getNonce(address);
    console.log("Received nonce:", nonce);
    
    // Step 2: Sign nonce
    const signature = await signMessage(nonce, address);
    console.log("Signature:", signature);
    
    // Step 3: Login with nonce and signature
    const firstname = sessionStorage.getItem("firstname") || "";
    const lastname = sessionStorage.getItem("lastname") || "";
    const phonenumber = sessionStorage.getItem("phonenumber") || "";
    const email = sessionStorage.getItem("email") || "";


    const loginResult = await RegisWithNonce({
      address, nonce, signature, firstname, lastname, phonenumber, email
    });
    
    return loginResult;
  } catch (error) {
    console.error('Secure login failed:', error);
    throw error;
  }
};