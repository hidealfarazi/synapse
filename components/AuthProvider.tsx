/**
 * components/AuthProvider.tsx
 * Menyimpan siapa yang sedang login (untuk tampilan akun) dan mengembalikan ke /login
 * begitu sesi berakhir — di tab ini maupun tab lain. Keamanan data tetap di server:
 * proxy.ts (gerbang halaman) dan RLS Supabase (gerbang data).
 */
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

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
    // INITIAL_SESSION dipancarkan segera setelah subscribe, jadi tidak perlu getSession() terpisah.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
      setReady(true);
      if (event === "SIGNED_OUT" && window.location.pathname !== "/login") {
        router.replace("/login");
        router.refresh();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  // scope "local": keluar dari perangkat ini saja, perangkat lain tetap masuk.
  const signOut = useCallback(async () => {
    await supabase.auth.signOut({ scope: "local" });
  }, []);

  const value = useMemo(() => ({ user, ready, signOut }), [user, ready, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
