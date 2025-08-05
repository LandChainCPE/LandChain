// src/services/UserService.ts

import axios from 'axios';

// กำหนด URL ของ API
const API_URL = 'http://localhost:8080/api/users'; // เปลี่ยน URL ตามที่ backend ของคุณใช้

interface CreateUserRequest {
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
  metamaskaddress: string;
}

export const createUser = async (userData: CreateUserRequest) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data; // คืนค่าข้อมูลจาก response
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
