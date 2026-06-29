import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCz2ZhDl2MhHyiODV8386VW8puoTYPeIOM",
  authDomain: "shopping-memo-35f5f.firebaseapp.com",
  projectId: "shopping-memo-35f5f",
  storageBucket: "shopping-memo-35f5f.firebasestorage.app",
  messagingSenderId: "730139258249",
  appId: "1:730139258249:web:82134f1382d99f49fcc558",
  measurementId: "G-5W18XCJWQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);