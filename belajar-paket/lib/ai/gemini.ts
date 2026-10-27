// Pemanggil Gemini (REST). HANYA dipakai di server (route handler). Kunci tidak pernah ke klien.
import { bump, today } from "./cache";
import type { Source } from "./types";

export class AiError extends Error {
  constructor(
    public code: "no_key" | "rate_limit" | "budget" | "disabled" | "bad_response" | "upstream",
    message: string,
  ) {
    super(message);
  }
}

export type Msg = { role: "user" | "model"; text: string };

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    groundingMetadata?: { groundingChunks?: { web?: { uri?: string; title?: string } }[] };
  }[];
}

async function spendCall() {
  const cap = Number(process.env.AI_DAILY_CALLS ?? 15);
  const n = await bump(`calls:${today()}`);
  if (n > cap) throw new AiError("budget", `Batas panggilan AI harian (${cap}) tercapai. Coba lagi besok.`);
}

export async function callGemini(opts: {
  system: string;
  messages: Msg[];
  search?: boolean; // Grounding with Google Search
  maxTokens?: number;
  temperature?: number;
}): Promise<{ text: string; sources: Source[] }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("no_key", "GEMINI_API_KEY belum diisi di .env.local");
  await spendCall();

  const model = process.env.GEMINI_MODEL ?? "gemini-3.7-flash"; // cek nama model di Google AI Studio
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: opts.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: { temperature: opts.temperature ?? 0.4, maxOutputTokens: opts.maxTokens ?? 1500 },
  };
  if (opts.search) body.tools = [{ google_search: {} }];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (res.status === 429) throw new AiError("rate_limit", "Kuota Gemini sedang habis. Coba lagi nanti.");
  if (!res.ok) throw new AiError("upstream", `Gemini ${res.status} (model ${model}): ${(await res.text()).slice(0, 300)}`);

  const data = (await res.json()) as GeminiResponse;
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
  if (!text) throw new AiError("bad_response", "Jawaban AI kosong.");

  // Sumber diambil dari metadata pencarian, BUKAN dari teks model (mencegah tautan karangan).
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const c of cand?.groundingMetadata?.groundingChunks ?? []) {
    const u = c.web?.uri;
    if (u && !seen.has(u)) {
      seen.add(u);
      sources.push({ title: c.web?.title ?? u, url: u });
    }
  }
  return { text, sources };
}

export function parseJson<T>(text: string): T {
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a < 0 || b <= a) throw new AiError("bad_response", "AI tidak mengembalikan JSON.");
  try {
    return JSON.parse(text.slice(a, b + 1)) as T;
  } catch {
    throw new AiError("bad_response", "JSON dari AI rusak.");
  }
}
