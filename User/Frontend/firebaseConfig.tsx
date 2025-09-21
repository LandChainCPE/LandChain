// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";  // ✅ ต้อง import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhrpPFyM9SNAUvOnskevstUka32PPZK8Y",
  authDomain: "landchain-d3730.firebaseapp.com",
  projectId: "landchain-d3730",
  storageBucket: "landchain-d3730.appspot.com", // ✅ ต้องใช้ .appspot.com
  messagingSenderId: "616368306985",
  appId: "1:616368306985:web:50d8e5ca367f707e649538",
  measurementId: "G-0Q53Y849K1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Export Storage ออกมาใช้งาน
export const storage = getStorage(app);
