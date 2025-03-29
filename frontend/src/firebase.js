import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBxYLrUpn81iMTDZsEBvvUepFWgauW2pmc",
  authDomain: "thcrg-a79b3.firebaseapp.com",
  projectId: "thcrg-a79b3",
  storageBucket: "thcrg-a79b3.firebasestorage.app",
  messagingSenderId: "369494608533",
  appId: "1:369494608533:web:38a7634e7b36e83d66699c",
  measurementId: "G-G448L7CGHB",
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === "app/duplicate-app") {
    app = initializeApp(firebaseConfig, "default");
  } else {
    console.error("Firebase initialization error:", error);
  }
}

const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, database, auth, storage };
