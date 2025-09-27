// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaceYSCse30USpuVOXfRyU-vBQvy7w6uU",
  authDomain: "landdepartment-e6b2a.firebaseapp.com",
  projectId: "landdepartment-e6b2a",
  storageBucket: "landdepartment-e6b2a.firebasestorage.app",
  messagingSenderId: "655573249727",
  appId: "1:655573249727:web:176d7551b684ee55b6200a",
  measurementId: "G-D0KD32FQYD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);