/**
 * lib/supabase/client.ts
 * Klien Supabase untuk browser. Sesi disimpan di cookie (via @supabase/ssr) sehingga
 * proxy.ts di server bisa ikut membaca sesi yang sama.
 * Hanya memakai publishable key; data dilindungi RLS (lihat supabase/migrations).
 */
import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

const { url, key } = supabaseConfig();
export const supabase = createBrowserClient(url, key);
