import { fail, guard } from "@/lib/ai/guard";
import { getRadar, isStale, refreshRadar, resolvePending } from "@/lib/ai/radar";

export const runtime = "nodejs";

// GET: radar tersimpan + penanda "perlu dicek ulang" (lebih dari 7 hari).
export async function GET(req: Request) {
  const g = guard(req);
  if (g) return g;
  const radar = await getRadar();
  return Response.json({ radar, stale: isStale(radar) });
}

// POST { action: "refresh" | "apply" | "dismiss", index?: number }
export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = (await req.json()) as { action?: string; index?: number };
    if (body.action === "refresh") {
      const radar = await getRadar();
      if (!isStale(radar) && radar.pending.length === 0) {
        return Response.json({ radar, stale: false, note: "Sudah dicek minggu ini." });
      }
      const fresh = await refreshRadar();
      return Response.json({ radar: fresh, stale: false });
    }
    if (body.action === "apply" || body.action === "dismiss") {
      const radar = await resolvePending(body.action, typeof body.index === "number" ? body.index : undefined);
      return Response.json({ radar, stale: isStale(radar) });
    }
    return Response.json({ error: "action tidak dikenal" }, { status: 400 });
  } catch (e) {
    return fail(e);
  }
}
