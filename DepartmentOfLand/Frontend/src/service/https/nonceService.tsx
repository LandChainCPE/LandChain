// const API_BASE_URL = 'https://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io';
const API_BASE_URL = 'http://localhost:8080';

interface NonceResponse {
  nonce: string;
}

interface LoginRequest {
  address: string;
  nonce: string;
  signature: string;
}

interface LoginResponse {
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

// ทำการ Get ค่า Nonce จากระบบมา
const getNonce = async (address: string): Promise<NonceResponse> => {
  const response = await fetch(`${API_BASE_URL}/nonce/${address}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get nonce: ${response.statusText}`);
  }
  
  return response.json();
};


// Sign message with MetaMask
const signMessage = async (message: string, address: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  });
  
  return signature;
};

// Login with nonce and signature
const loginWithNonce = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/department/login`, {
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

const SecureLogin = async (address: string): Promise<LoginResponse> => {
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


export {
  SecureLogin,
}