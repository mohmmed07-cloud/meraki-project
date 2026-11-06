// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAkM5g5IQr3YvbM8Wso1USBg0FCXWH4RAQ",
  authDomain: "judebateclub2025-392e5.firebaseapp.com",
  projectId: "judebateclub2025-392e5",
  storageBucket: "judebateclub2025-392e5.firebasestorage.app",
  messagingSenderId: "1057196910405",
  appId: "1:1057196910405:web:948467443f7d7dfbe7002c",
  measurementId: "G-XJP8GGBD3G"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);