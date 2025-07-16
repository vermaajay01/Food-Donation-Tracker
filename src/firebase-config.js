
// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace with your actual Firebase project configuration from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyANPhy8s2bk4-9qEe1XF_9N1iEWFTKp_DQ",
  authDomain: "fooddonationtracker-def9b.firebaseapp.com",
  projectId: "fooddonationtracker-def9b",
  storageBucket: "fooddonationtracker-def9b.firebasestorage.app",
  messagingSenderId: "903178406644",
  appId: "1:903178406644:web:3af47643b4e248412deca1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };