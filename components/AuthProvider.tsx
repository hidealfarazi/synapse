/**
 * components/AuthProvider.tsx
 * Menyimpan pengguna yang sedang aktif (Firebase Auth) dan mengelola sinkronisasi cookie sesi
 * untuk server proxy.ts.
 */
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({ user: null, ready: false, signOut: async () => {} });

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({ id: fbUser.uid, email: fbUser.email ?? null });
        // Simpan cookie sesi (30 hari) agar server proxy.ts mengizinkan akses halaman
        document.cookie = `belajar_session=${fbUser.uid}; path=/; max-age=2592000; SameSite=Lax`;
      } else {
        setUser(null);
        document.cookie = "belajar_session=; path=/; max-age=0; SameSite=Lax";
        if (window.location.pathname !== "/login") {
          router.replace("/login");
          router.refresh();
        }
      }
      setReady(true);
    });

    return () => unsubscribe();
  }, [router]);

  const signOut = useCallback(async () => {
    document.cookie = "belajar_session=; path=/; max-age=0; SameSite=Lax";
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(() => ({ user, ready, signOut }), [user, ready, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
