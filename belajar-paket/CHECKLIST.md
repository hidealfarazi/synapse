# Daftar kerja lengkap (urut, jangan loncat)

## A. Persiapan (sekali)
1. Commit semua perubahan sekarang: `git add -A` lalu `git commit -m "checkpoint sebelum p1"` lalu push. `git status` harus bersih.
2. `npm run dev`, `npm run build`, `npm run lint` harus lolos. Jika tidak, perbaiki dulu / kirim galat ke Claude.
3. Edit AGENTS.md: ganti aturan lama "No rain, no video ..." dengan isi `hermes/00-AGENTS-patch.md`.
4. Buka docs/DESIGN.md: jika masih Jepang-Jawa (emas, kanji, kawung), tidak apa-apa; Hermes akan memperbaruinya.
5. Pastikan MCP React Bits tersambung di Hermes.
6. Buka terminal Hermes DI FOLDER PROYEK (bukan folder induk).

## B. Pasang folder AI (kamu sendiri, bukan Hermes)
1. Buat kunci di Google AI Studio.
2. Jalankan: `powershell -ExecutionPolicy Bypass -File .\pasang.ps1 -Project "D:\path\ke\proyek"`
   (atau salin manual: `lib/ai/` -> `lib/ai/`, `app/api/ai/` -> `app/api/ai/`, `.env.example` -> root).
3. Buka `.env.local`, isi `GEMINI_API_KEY`. Cek nama model di AI Studio, ubah `GEMINI_MODEL` bila perlu.
4. `npm run build` harus lolos. Lalu `npm run dev` dan jalankan 4 uji di README-AI.md.
5. Jika ada uji gagal (nama model, pencarian web tidak tersedia, dll.), kirim teks galatnya ke Claude. Jangan lanjut ke UI AI dulu.
   Commit: `git add -A` lalu `git commit -m "tambah backend AI"`.

## C. Sesi Hermes (satu per satu, tiap sesi di cabang sendiri)
1. `hermes/01-p1-learning.md`   -> cabang hermes/p1-learning
2. `hermes/02-home-recommendation.md` -> cabang hermes/home-recommendation
3. `hermes/03-ai-ui.md` -> cabang hermes/ai-ui (hanya jika uji B.4 lolos)
Setelah tiap sesi: cek di HP (390px), kirim screenshot ke Claude, baru merge ke main.

## D. Tahap berikutnya (Claude)
Supabase + login + RLS, ganti lib/ai/cache.ts dan guard.ts. JANGAN deploy ke Vercel sebelum ini selesai.
