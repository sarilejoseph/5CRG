import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOCQzMqCzsGxcNGIBfvclGlksL20faVgU",
  authDomain: "farmmartapp-951fb.firebaseapp.com",
  projectId: "farmmartapp-951fb",
  storageBucket: "farmmartapp-951fb.appspot.com",
  messagingSenderId: "1023068644817",
  appId: "1:1023068644817:web:25916435cc0bad9fc82cf0",
  measurementId: "G-VQXBLB4R9D",
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
const firestore = getFirestore(app);

export { app, database, auth, storage, firestore };
