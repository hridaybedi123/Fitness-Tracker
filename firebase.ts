// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1nJI_uPX_kt4tsLKWjq2--z5bflN0OJw",
  authDomain: "modern-fitness-app-b5050.firebaseapp.com",
  projectId: "modern-fitness-app-b5050",
  storageBucket: "modern-fitness-app-b5050.appspot.com",
  messagingSenderId: "893095592245",
  appId: "1:893095592245:web:ef5c621fd625ba2026cc7c",
  measurementId: "G-R55TV3FNWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll use
export const db = getFirestore(app);
export const auth = getAuth(app);
