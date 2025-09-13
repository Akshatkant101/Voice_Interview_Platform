import { getApp, getApps, initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_CLIENT_TS_API,
  authDomain: "questly-5b969.firebaseapp.com",
  projectId: "questly-5b969",
  storageBucket: "questly-5b969.firebasestorage.app",
  messagingSenderId: "399822741311",
  appId: "1:399822741311:web:55c72a914f05326bcefd8a",
  measurementId: "G-VVN44PTPXW"
};

// Initialize Firebase
const app =!getApps.length ?  initializeApp(firebaseConfig):getApp();
export const auth=getAuth(app);
export const db= getFirestore(app);