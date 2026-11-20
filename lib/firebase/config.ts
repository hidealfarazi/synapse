/**
 * lib/firebase/config.ts
 * Konfigurasi Firebase dari variabel lingkungan publik.
 * Memiliki fallback aman saat build statis Next.js agar tidak gagal prerender
 * bila file .env.local belum dibuat di mesin lokal.
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  isConfigured: boolean;
}

export function getFirebaseConfig(): FirebaseConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  const isConfigured = Boolean(apiKey && authDomain && projectId && appId);

  return {
    apiKey: apiKey || "dummy-api-key-for-prerender",
    authDomain: authDomain || "dummy-app.firebaseapp.com",
    projectId: projectId || "dummy-project",
    storageBucket: storageBucket || "dummy-project.appspot.com",
    messagingSenderId: messagingSenderId || "123456789",
    appId: appId || "1:123456789:web:abcdef",
    measurementId,
    isConfigured,
  };
}
