/**
 * lib/firebase/client.ts
 * Inisialisasi klien Firebase (Auth dan Firestore).
 * Menggunakan singleton pattern untuk menghindari instansiasi ganda saat Hot Module Replacement (HMR).
 */
import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfig } from "./config";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function initFirebase() {
  if (appInstance && authInstance && dbInstance) {
    return { app: appInstance, auth: authInstance, db: dbInstance };
  }

  const config = getFirebaseConfig();
  appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
  authInstance = getAuth(appInstance);
  // ignoreUndefinedProperties mencegah error runtime Firestore jika ada properti undefined
  dbInstance = initializeFirestore(appInstance, {
    ignoreUndefinedProperties: true,
  });

  return { app: appInstance, auth: authInstance, db: dbInstance };
}

const instances = initFirebase();
export const app = instances.app;
export const auth = instances.auth;
export const db = instances.db;
