/**
 * lib/firebase/proxy.ts
 * Penjaga rute server untuk proxy.ts (Next.js 16).
 * Memeriksa cookie sesi 'belajar_session'.
 */
import { NextResponse, type NextRequest } from "next/server";

// Halaman yang dapat diakses publik tanpa login.
const PUBLIC_PATHS = ["/login", "/auth/callback"];

export function updateSession(request: NextRequest): NextResponse {
  const session = request.cookies.get("belajar_session")?.value;
  const signedIn = Boolean(session);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!signedIn && !isPublic) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  if (signedIn && pathname === "/login") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return NextResponse.next({ request });
}
