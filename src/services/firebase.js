import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBP2i6vgEgfmW2iuWG4zEhL9Hi7pQ6c528",
  authDomain: "billyard-ae9e6.firebaseapp.com",
  projectId: "billyard-ae9e6",
  storageBucket: "billyard-ae9e6.firebasestorage.app",
  messagingSenderId: "131068814659",
  appId: "1:131068814659:web:aad624283c3150d625bbf6",
  measurementId: "G-FY92B45J9L"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
