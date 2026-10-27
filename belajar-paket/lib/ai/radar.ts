import { cacheGet, cacheSet, today } from "./cache";
import { callGemini, parseJson, AiError } from "./gemini";
import type { Confidence, Radar, RadarChange, RadarItem, RadarKind, RadarStatus, RadarTrack } from "./types";

// TITIK AWAL (bukan fakta mutlak): disusun dari roadmap pelajaran 2026 dan portofolio pemilik.
// Pembaruan mingguan AI akan MENGUSULKAN perubahan; pemilik yang menyetujui.
const SEED: RadarItem[] = [
  { id: "git", name: "Git & GitHub", kind: "tool", track: "web", status: "adopt", why: "Dasar kerja tim dan portofolio.", startWhen: "Sekarang" },
  { id: "sql-postgresql", name: "SQL & PostgreSQL", kind: "language", track: "data", status: "adopt", why: "Hampir semua aplikasi butuh basis data.", startWhen: "Sekarang" },
  { id: "typescript", name: "TypeScript", kind: "language", track: "web", status: "adopt", why: "Standar proyek web modern, aman untuk kode hasil AI.", startWhen: "Setelah dasar JavaScript" },
  { id: "react-nextjs", name: "React + Next.js", kind: "framework", track: "web", status: "adopt", why: "Ekosistem front end terbesar.", startWhen: "Setelah TypeScript dasar" },
  { id: "laravel", name: "Laravel", kind: "framework", track: "web", status: "trial", why: "Back end PHP yang produktif, banyak dipakai lokal.", startWhen: "Satu proyek kecil" },
  { id: "python", name: "Python", kind: "language", track: "ai", status: "adopt", why: "Bahasa utama AI, data, dan otomasi.", startWhen: "Sekarang" },
  { id: "llm-api", name: "Integrasi LLM lewat API", kind: "platform", track: "ai", status: "trial", why: "Pembeda: menambah fitur AI ke aplikasi nyata.", startWhen: "Setelah Tier 2" },
  { id: "rag", name: "RAG (embedding + vector DB)", kind: "tool", track: "ai", status: "assess", why: "Menjawab dari data sendiri; konsep penting Tier 3.", startWhen: "Setelah integrasi LLM" },
  { id: "react-native", name: "React Native / Expo", kind: "framework", track: "mobile", status: "assess", why: "Aplikasi HP dengan keahlian React yang sama.", startWhen: "Setelah React" },
  { id: "esp32", name: "C/C++ untuk ESP32/Arduino", kind: "language", track: "iot", status: "assess", why: "Jalur IoT sesuai minatmu.", startWhen: "Proyek kecil" },
  { id: "phaser", name: "Phaser (game web)", kind: "framework", track: "game", status: "trial", why: "Game berbasis web dengan JavaScript/TypeScript.", startWhen: "Proyek kecil" },
];

const KEY = "radar";
const WEEK = 7 * 24 * 3600 * 1000;

export async function getRadar(): Promise<Radar> {
  return (
    (await cacheGet<Radar>(KEY)) ?? { items: SEED, sources: [], pending: [], checkedAt: null, updatedAt: null }
  );
}
export const isStale = (r: Radar) => !r.checkedAt || Date.now() - new Date(r.checkedAt).getTime() > WEEK;

const STATUS: readonly string[] = ["adopt", "trial", "assess", "hold"];
const KIND: readonly string[] = ["language", "framework", "tool", "platform"];
const TRACK: readonly string[] = ["web", "mobile", "ai", "iot", "game", "data"];
const CONF: readonly string[] = ["low", "medium", "high"];
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function sanitize(raw: unknown, items: RadarItem[]): RadarChange | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const reason = str(r.reason, 300);
  const confidence = (CONF.includes(String(r.confidence)) ? r.confidence : "low") as Confidence;
  if (!reason) return null;
  if (r.type === "status") {
    const itemId = str(r.itemId, 80);
    if (!items.some((i) => i.id === itemId) || !STATUS.includes(String(r.to))) return null;
    return { type: "status", itemId, to: r.to as RadarStatus, reason, confidence };
  }
  if (r.type === "new" && typeof r.item === "object" && r.item !== null) {
    const it = r.item as Record<string, unknown>;
    const name = str(it.name, 60);
    const id = slug(str(it.id, 60) || name);
    if (!name || !id || items.some((i) => i.id === id)) return null;
    if (!KIND.includes(String(it.kind)) || !TRACK.includes(String(it.track)) || !STATUS.includes(String(it.status))) return null;
    return {
      type: "new",
      item: {
        id, name, kind: it.kind as RadarKind, track: it.track as RadarTrack, status: it.status as RadarStatus,
        why: str(it.why, 200), startWhen: str(it.startWhen, 80) || "Pantau dulu",
      },
      reason, confidence,
    };
  }
  return null;
}

const SYSTEM = `Kamu analis tren teknologi untuk seorang siswa SMK jurusan RPL di Indonesia yang menuju karier developer.
Tugas: tinjau "radar teknologi" (bahasa, framework, alat) yang diberikan, dan USULKAN perubahan HANYA jika pencarian web
menemukan bukti kuat dan terbaru (rilis resmi, blog/roadmap resmi proyek, survei developer, laporan lowongan kerja).
Aturan:
1. Jangan ikut hype. Satu perubahan butuh minimal dua sumber kredibel yang sejalan.
2. Jangan menaikkan/menurunkan status karena satu artikel. Fondasi (Git, SQL, dasar pemrograman) jarang berubah.
3. Jika tidak ada bukti kuat, kembalikan "changes": [] . Itu jawaban yang valid dan baik.
4. Jangan mengarang rilis, angka, atau sumber.
5. Status: adopt = pelajari sekarang, trial = coba di proyek kecil, assess = pantau, hold = tunda.
Keluarkan HANYA JSON, tanpa teks lain, bentuk:
{"changes":[
 {"type":"new","item":{"id":"","name":"","kind":"language|framework|tool|platform","track":"web|mobile|ai|iot|game|data","status":"adopt|trial|assess|hold","why":"","startWhen":""},"reason":"","confidence":"low|medium|high"},
 {"type":"status","itemId":"id yang ada","to":"adopt|trial|assess|hold","reason":"","confidence":"low|medium|high"}
]}
Bahasa Indonesia. "reason" maksimal 2 kalimat. Maksimal 5 perubahan.`;

export async function refreshRadar(): Promise<Radar> {
  const radar = await getRadar();
  const input = { tanggal: today(), radar: radar.items.map(({ id, name, track, status }) => ({ id, name, track, status })) };
  const { text, sources } = await callGemini({
    system: SYSTEM,
    messages: [{ role: "user", text: JSON.stringify(input) }],
    search: true,
    maxTokens: 2500,
    temperature: 0.2,
  });
  const parsed = parseJson<{ changes?: unknown[] }>(text);
  if (!Array.isArray(parsed.changes)) throw new AiError("bad_response", "Format usulan tidak valid.");
  radar.pending = parsed.changes.map((c) => sanitize(c, radar.items)).filter((c): c is RadarChange => c !== null).slice(0, 5);
  radar.sources = sources.slice(0, 8);
  radar.checkedAt = new Date().toISOString();
  await cacheSet(KEY, radar);
  return radar;
}

export async function resolvePending(action: "apply" | "dismiss", index?: number): Promise<Radar> {
  const r = await getRadar();
  const picked = index === undefined ? r.pending : r.pending.slice(index, index + 1);
  if (action === "apply") {
    for (const c of picked) {
      if (c.type === "new" && !r.items.some((i) => i.id === c.item.id)) r.items.push(c.item);
      if (c.type === "status") {
        const it = r.items.find((i) => i.id === c.itemId);
        if (it) it.status = c.to;
      }
    }
    if (picked.length) r.updatedAt = new Date().toISOString();
  }
  r.pending = index === undefined ? [] : r.pending.filter((_, i) => i !== index);
  await cacheSet(KEY, r);
  return r;
}
