import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions, httpsCallable } from "firebase/functions";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

export interface Shelter {
  shelter_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  available: number;
  status: "operational" | "closed" | "maintenance" | "unknown";
}

export interface RoadSegment {
  road_id: string;
  geojson: any; // GeoJSON LineString feature
  status: "safe" | "blocked" | "risky";
  last_updated: number;
}

export interface RouteResult {
  route: {
    polyline: string;
    distance_km: number;
    duration_min: number;
    steps: string[];
  };
  warnings: string[];
  shelter?: {
    name: string;
    lat: number;
    lon: number;
    capacity_available: number;
    shelter_id?: string;
  };
}

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let functions: Functions | undefined;
let auth: Auth | undefined;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

export const getFirebase = () => {
  if (!app) {
    const config = {
      apiKey: "AIzaSyBiqwcZgRvNBq3liSY7fHYnfEIgXLSkEys",
      authDomain: "jalrakshak-f1d6a.firebaseapp.com",
      projectId: "jalrakshak-f1d6a",
      storageBucket: "jalrakshak-f1d6a.firebasestorage.app",
      messagingSenderId: "170302508520",
      appId: "1:170302508520:web:f6a229ce2c7e368bbd285d",
      measurementId: "G-LY5SLJLZT4",
    } as const;

    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    functions = getFunctions(app);
    auth = getAuth(app);
  }
  return { app: app!, db: db!, functions: functions!, auth: auth! };
};

// Cloud Functions
export const getSafeRouteFunction = () => {
  const { functions } = getFirebase();
  return httpsCallable(functions, "getSafeRoute");
};

export const getNearestShelterFunction = () => {
  const { functions } = getFirebase();
  return httpsCallable(functions, "getNearestShelter");
};

// Admin helper functions
export const isAdmin = (userEmail?: string | null): boolean => {
  const adminEmails = [
    "admin@janrakshak.com",
    "lb4397@srmist.edu.in", // Main admin user
  ];
  return userEmail ? adminEmails.includes(userEmail) : false;
};

export const getCurrentUserEmail = (): string | null => {
  const { auth } = getFirebase();
  return auth.currentUser?.email || null;
};
