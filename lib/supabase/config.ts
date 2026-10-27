/**
 * lib/supabase/config.ts
 * Satu tempat membaca env Supabase publik. Sengaja melempar error yang jelas
 * bila env belum diisi, supaya kesalahan konfigurasi tidak berubah jadi bug login misterius.
 */
export function supabaseConfig(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Env Supabase belum diisi: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (lihat .env.example)."
    );
  }
  return { url, key };
}
