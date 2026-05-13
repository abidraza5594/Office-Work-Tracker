import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyCEVxQH81x8n8mXyBIn9_gLn0nPZP8kj7o",
  authDomain: "office-work-tracker-1f186.firebaseapp.com",
  projectId: "office-work-tracker-1f186",
  storageBucket: "office-work-tracker-1f186.firebasestorage.app",
  messagingSenderId: "209794339527",
  appId: "1:209794339527:web:0e092868a71e1147c3a4e2",
  measurementId: "G-2G3YHH70FV"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId
};

export const missingFirebaseEnvKeys = Object.entries(firebaseConfig)
  .filter(([key]) => key !== "measurementId")
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigError =
  missingFirebaseEnvKeys.length > 0
    ? `Missing Firebase environment values: ${missingFirebaseEnvKeys.join(", ")}`
    : null;

let initializedApp: FirebaseApp | null = null;
let initializedAuth: Auth | null = null;
let initializedDb: Firestore | null = null;

if (firebaseConfigError) {
  console.warn(firebaseConfigError);
} else {
  initializedApp = initializeApp(firebaseConfig);
  initializedAuth = getAuth(initializedApp);
  initializedDb = getFirestore(initializedApp);
}

export const app = initializedApp;
export const auth = initializedAuth;
export const db = initializedDb;
