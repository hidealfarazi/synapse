import { cacheGet, cacheSet, today } from "@/lib/ai/cache";
import { callGemini, parseJson, AiError } from "@/lib/ai/gemini";
import { fail, guard } from "@/lib/ai/guard";
import { getRadar } from "@/lib/ai/radar";
import type { Recommendation, Tier } from "@/lib/ai/types";

export const runtime = "nodejs";

const SYSTEM = `Kamu pembimbing belajar untuk siswa SMK jurusan RPL. Susun SATU fokus belajar hari ini dan 2 alternatif.
Aturan:
1. Urutan tingkat: fondasi -> kompetensi -> ai. Jangan menyarankan tingkat lebih tinggi bila tingkat di bawahnya
   belum ada di daftar "selesai".
2. Pertimbangkan beban: jika ada 2 tenggat atau lebih dalam 12 jam, pilih sesi 20 menit atau kurang dan sebutkan alasannya.
3. Radar teknologi adalah sinyal industri. Utamakan item status adopt/trial yang relevan; jangan jadikan item hold/assess fokus utama.
4. Topik harus konkret dan selesai dalam satu sesi (bukan "belajar React", tetapi "Membuat komponen berbagi state dengan useState").
5. Jangan mengarang sumber atau tautan.
Keluarkan HANYA JSON:
{"topic":"","reason":"1-2 kalimat","tier":"fondasi|kompetensi|ai","minutes":25,"radarItemId":"id radar atau kosong",
 "alternatives":[{"topic":"","tier":"fondasi|kompetensi|ai","minutes":20},{"topic":"","tier":"fondasi|kompetensi|ai","minutes":20}]}
Bahasa Indonesia.`;

type Body = {
  tasks?: { subject: string; title: string; dueInHours: number }[]; // jangan kirim data pribadi
  doneTopics?: string[];
  force?: boolean;
};
const TIERS: readonly string[] = ["fondasi", "kompetensi", "ai"];
const tier = (v: unknown): Tier => (TIERS.includes(String(v)) ? (v as Tier) : "fondasi");

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = (await req.json()) as Body;
    const key = `recommend:${today()}`;
    if (!body.force) {
      const cached = await cacheGet<Recommendation>(key);
      if (cached) return Response.json({ recommendation: cached, cached: true });
    }
    const radar = await getRadar();
    const input = {
      tugas: (body.tasks ?? []).slice(0, 10),
      selesai: (body.doneTopics ?? []).slice(0, 40),
      radar: radar.items.filter((i) => i.status === "adopt" || i.status === "trial").map(({ id, name, track, status, startWhen }) => ({ id, name, track, status, startWhen })),
    };
    const { text } = await callGemini({
      system: SYSTEM,
      messages: [{ role: "user", text: JSON.stringify(input) }],
      maxTokens: 900,
      temperature: 0.5,
    });
    const p = parseJson<Partial<Recommendation>>(text);
    if (!p.topic || !p.reason) throw new AiError("bad_response", "Rekomendasi tidak lengkap.");
    const rec: Recommendation = {
      topic: String(p.topic).slice(0, 120),
      reason: String(p.reason).slice(0, 300),
      tier: tier(p.tier),
      minutes: Math.min(90, Math.max(5, Number(p.minutes) || 25)),
      radarItemId: p.radarItemId ? String(p.radarItemId).slice(0, 80) : undefined,
      alternatives: (Array.isArray(p.alternatives) ? p.alternatives : []).slice(0, 2).map((a) => ({
        topic: String(a?.topic ?? "").slice(0, 120),
        tier: tier(a?.tier),
        minutes: Math.min(90, Math.max(5, Number(a?.minutes) || 20)),
      })).filter((a) => a.topic),
      generatedAt: new Date().toISOString(),
      signalSource: radar.sources[0], // sumber nyata dari pencarian mingguan, bila ada
    };
    await cacheSet(key, rec);
    return Response.json({ recommendation: rec, cached: false });
  } catch (e) {
    return fail(e);
  }
}
