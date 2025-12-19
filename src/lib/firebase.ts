import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyALq3_QCmTPHQfoA8rsqUoBGS1Z7g34zlE",
  authDomain: "shadow-f109b.firebaseapp.com",
  databaseURL: "https://shadow-f109b-default-rtdb.firebaseio.com",
  projectId: "shadow-f109b",
  storageBucket: "shadow-f109b.firebasestorage.app",
  messagingSenderId: "36806129856",
  appId: "1:36806129856:web:ffa42aa4cf3a5e3472d525",
  measurementId: "G-BG3GERE1BK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
