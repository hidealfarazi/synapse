// Penyimpanan JSON sederhana untuk DEVELOPMENT LOKAL (folder .data/, jangan di-commit).
// Di Vercel sistem file tidak permanen: ganti isi file ini dengan Supabase nanti
// (antarmuka cacheGet/cacheSet/bump tetap sama).
import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), ".data", "ai-cache.json");

export function assertAiStorage() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("AI storage is not configured: persistent atomic quota storage required.");
  }
}
type Store = Record<string, { value: unknown; at: number }>;

async function load(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}
async function save(s: Store) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(s, null, 2));
}

export async function cacheGet<T>(key: string, maxAgeMs?: number): Promise<T | null> {
  const s = await load();
  const e = s[key];
  if (!e) return null;
  if (maxAgeMs !== undefined && Date.now() - e.at > maxAgeMs) return null;
  return e.value as T;
}
export async function cacheSet(key: string, value: unknown) {
  const s = await load();
  s[key] = { value, at: Date.now() };
  await save(s);
}
export async function bump(key: string): Promise<number> {
  const s = await load();
  const n = (typeof s[key]?.value === "number" ? (s[key].value as number) : 0) + 1;
  s[key] = { value: n, at: Date.now() };
  await save(s);
  return n;
}
export const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
