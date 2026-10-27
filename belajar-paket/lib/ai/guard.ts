import { AiError } from "./gemini";

// SEBELUM DEPLOY: ganti dengan pengecekan sesi login Supabase.
export function guard(req: Request): Response | null {
  if (process.env.AI_ENABLED !== "true") {
    return Response.json({ error: "Fitur AI dimatikan (AI_ENABLED)." }, { status: 503 });
  }
  const owner = process.env.AI_OWNER_KEY;
  if (owner && req.headers.get("x-owner-key") !== owner) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  return null;
}

export function fail(e: unknown): Response {
  if (e instanceof AiError) {
    const status = e.code === "rate_limit" || e.code === "budget" ? 429 : e.code === "no_key" ? 500 : 502;
    return Response.json({ error: e.message, code: e.code }, { status });
  }
  return Response.json({ error: "Terjadi kesalahan." }, { status: 500 });
}
