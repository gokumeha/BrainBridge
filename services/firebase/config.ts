import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- IMPORTANT ---
// The placeholder values below are the cause of the "auth/api-key-not-valid" error.
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Go to Project Settings > General, and find your web app's configuration.
// 3. Replace the placeholder values below with your actual Firebase config to resolve the error.
const firebaseConfig = {
  apiKey: "AIzaSyCyw-YqqHBViadlRR41ttQHM6wvPfEgUsw",
  authDomain: "betbrains-d09f6.firebaseapp.com",
  projectId: "betbrains-d09f6",
  storageBucket: "betbrains-d09f6.firebasestorage.app",
  messagingSenderId: "1019276671367",
  appId: "1:1019276671367:web:03b256551f82cb8286fb22",
  measurementId: "G-B47VTGJ0JF"
};

// This check helps developers realize the configuration is missing during development.
if (firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY") {
    console.error("Firebase configuration is not set. Please update services/firebase/config.ts with your project credentials to fix authentication errors.");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };