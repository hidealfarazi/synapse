/**
 * lib/supabase/proxy.ts
 * Dipakai proxy.ts: menyegarkan sesi (token refresh -> cookie) lalu memutuskan
 * apakah request boleh lanjut. Memakai getClaims() (verifikasi JWT), bukan getSession().
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "./config";

// Halaman yang boleh dibuka tanpa login.
const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, key } = supabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Jangan taruh kode lain antara createServerClient dan getClaims (dokumentasi Supabase).
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!signedIn && !isPublic) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.search = "";
    const res = NextResponse.redirect(redirect);
    // Bawa cookie hasil refresh (kalau ada) agar sesi tidak hilang.
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  }

  if (signedIn && pathname === "/login") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/";
    redirect.search = "";
    const res = NextResponse.redirect(redirect);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  }

  return response;
}
