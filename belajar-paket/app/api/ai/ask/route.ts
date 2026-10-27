import { bump, today } from "@/lib/ai/cache";
import { callGemini, type Msg } from "@/lib/ai/gemini";
import { fail, guard } from "@/lib/ai/guard";

export const runtime = "nodejs";

const BASE = `Kamu tutor singkat untuk siswa SMK jurusan RPL. Jawab dalam bahasa Indonesia, maksimal sekitar 120 kata,
beri contoh kode pendek hanya jika perlu. Jika tidak yakin atau pertanyaan tentang versi/rilis terbaru dan pencarian web
tidak aktif, katakan terus terang dan sarankan menyalakan "Cek web". Jangan mengarang sumber.`;
const MODES: Record<string, string> = {
  normal: "",
  analogy: "Mulai dengan analogi sehari-hari, baru konsep teknisnya. Jangan langsung beri kode.",
  hint: "JANGAN beri solusi lengkap. Tunjuk konsep yang kemungkinan salah dipahami dan bagian mana yang perlu dicek.",
  quiz: "Buat 3 soal singkat tanpa jawaban. Jawaban hanya diberikan jika diminta pada pesan berikutnya.",
};

type Body = { question?: string; history?: Msg[]; mode?: string; search?: boolean };

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = (await req.json()) as Body;
    const q = (body.question ?? "").trim().slice(0, 600);
    if (!q) return Response.json({ error: "Pertanyaan kosong." }, { status: 400 });

    const cap = Number(process.env.AI_DAILY_ASKS ?? 10);
    if ((await bump(`asks:${today()}`)) > cap) {
      return Response.json({ error: `Batas tanya harian (${cap}) tercapai.`, code: "budget" }, { status: 429 });
    }
    const history = (body.history ?? [])
      .filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string")
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text.slice(0, 800) }));

    const { text, sources } = await callGemini({
      system: `${BASE} ${MODES[body.mode ?? "normal"] ?? ""}`,
      messages: [...history, { role: "user", text: q }],
      search: body.search === true,
      maxTokens: 700,
      temperature: 0.5,
    });
    return Response.json({ answer: text, sources });
  } catch (e) {
    return fail(e);
  }
}
