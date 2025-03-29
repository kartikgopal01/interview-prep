// Import the functions you need from the SDKs you need
import { initializeApp,getApps,getApp } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAk9Ev6mafndiY2j9RBr0SNHfH5J4V2dUk",
  authDomain: "interviewprep-71430.firebaseapp.com",
  projectId: "interviewprep-71430",
  storageBucket: "interviewprep-71430.firebasestorage.app",
  messagingSenderId: "70622736280",
  appId: "1:70622736280:web:a1dbd9d30e7e2b340645ed",
  measurementId: "G-GD4DVSVYTS"
};

// Initialize Firebase
const app = !getApps.length?initializeApp(firebaseConfig):getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);