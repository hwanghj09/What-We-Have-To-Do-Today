import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDdtDNfqvrRpppbaE4cjYBD8QejI_4-3SA",
  authDomain: "what-we-have-to-do-today.firebaseapp.com",
  projectId: "what-we-have-to-do-today",
  storageBucket: "what-we-have-to-do-today.firebasestorage.app",
  messagingSenderId: "129752079783",
  appId: "1:129752079783:web:5a68510d4857e85d50ea82"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
