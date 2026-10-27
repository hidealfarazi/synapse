import { AiError } from "./gemini";

import { assertAiStorage } from "./cache";

// Ditutup sampai login server-side dan penyimpanan kuota persisten tersedia.
export function guard(req: Request): Response | null {
  if (process.env.AI_ENABLED !== "true") {
    return Response.json({ error: "Fitur AI dimatikan (AI_ENABLED)." }, { status: 503 });
  }
  const owner = process.env.AI_OWNER_KEY;
  if (!owner) {
    return Response.json({ error: "AI_OWNER_KEY belum diatur." }, { status: 503 });
  }
  if (req.headers.get("x-owner-key") !== owner) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    assertAiStorage();
  } catch {
    return Response.json({ error: "Penyimpanan kuota AI belum tersedia." }, { status: 503 });
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
