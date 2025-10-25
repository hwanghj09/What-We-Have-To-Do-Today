import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdtDNfqvrRpppbaE4cjYBD8QejI_4-3SA",
  authDomain: "what-we-have-to-do-today.firebaseapp.com",
  projectId: "what-we-have-to-do-today",
  storageBucket: "what-we-have-to-do-today.firebasestorage.app",
  messagingSenderId: "129752079783",
  appId: "1:129752079783:web:5a68510d4857e85d50ea82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
