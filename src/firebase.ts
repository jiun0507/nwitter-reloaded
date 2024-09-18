import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEc6dJcMcsMGaEAnsBWWRxDpyF24oRMvM",
  authDomain: "teebox-fdb67.firebaseapp.com",
  projectId: "teebox-fdb67",
  storageBucket: "teebox-fdb67.appspot.com",
  messagingSenderId: "542608348073",
  appId: "1:542608348073:web:522a4e595b5a208ad96ab8",
  measurementId: "G-XEGW4LLJE6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);

export const ACTIVITY_FEEDS_USER_DB_PATH =`activities/user`
export const ACTIVITY_FEEDS_AGGREGATE_DB_PATH =`activities/aggregate/unsorted`
