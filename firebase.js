// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjhQwpaBLRWwcKi3cpb__WniFKnQCNvw4",
  authDomain: "bill-split-app-5e671.firebaseapp.com",
  projectId: "bill-split-app-5e671",
  storageBucket: "bill-split-app-5e671.firebasestorage.app",
  messagingSenderId: "239445268838",
  appId: "1:239445268838:web:7673c87a0fd8cea777d0a7",
  measurementId: "G-0XEKZJ9KNP"
};

// Initialize Firebase
// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
const db = getFirestore(app);

// ✅ Export `db` correctly
export { db };
