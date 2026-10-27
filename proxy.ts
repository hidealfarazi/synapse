/**
 * proxy.ts (Next.js 16: pengganti middleware)
 * Gerbang login sisi server: semua halaman kecuali /login dan /auth/callback
 * butuh sesi Supabase yang valid. API AI (/api/ai) punya penjaga sendiri (lib/ai/guard.ts)
 * dan tidak diubah di sini.
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Lewati aset statis, ikon, video hujan, dan route API AI.
    "/((?!_next/static|_next/image|favicon.ico|api/ai|hujan-loop.mp4|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
