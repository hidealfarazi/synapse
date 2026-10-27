Cabang `hermes/ai-ui`. Baca AGENTS.md dan docs/. Folder lib/ai/ dan app/api/ai/ SUDAH ADA
dan milik pemilik: JANGAN diubah, dipindah, atau disalin ulang. UI hanya memanggil route
/api/ai/* lewat fetch. JANGAN sentuh .env atau kunci API. Jangan kirim data pribadi ke API.

1. Hari Ini (hero): ganti data contoh dengan POST /api/ai/recommend (kirim tasks: {subject,
   title, dueInHours} dari repo; doneTopics dari jalur belajar). Tampilkan topic, reason, tier,
   minutes, signalSource (tautan "Sumber", target _blank, rel noopener, keterangan "Saran AI,
   cek sumbernya" hanya bila ada). "Ganti topik" memilih salah satu alternatives tanpa
   memanggil API. Jika API gagal, tampilkan data contoh lama dengan catatan kecil
   "AI belum tersedia" (jangan tampilkan galat teknis).
2. Belajar: bagian baru "Roadmap tech stack" (borderless). GET /api/ai/radar. Kelompokkan per
   track (Web, Data, AI, Mobile, IoT, Game). Tiap baris: nama, jenis (bahasa/framework/alat),
   label status Indonesia (Pelajari sekarang / Coba / Pantau / Tunda), satu kalimat alasan,
   "Mulai: <startWhen>".
3. "Perubahan minggu ini": tampilkan radar.pending; tiap usulan dengan alasan, tingkat
   keyakinan, teks aksi "Terapkan" dan "Abaikan" (POST /api/ai/radar action apply/dismiss
   dengan index). Jika stale = true tampilkan teks aksi "Cek pembaruan" (action refresh)
   dengan keadaan memuat, lalu radar.sources sebagai tautan kecil.
4. Kotak "Tanya dikit" di Belajar: input garis-bawah, pilihan mode (Biasa/Analogi/Petunjuk/
   Kuis) sebagai teks, sakelar "Cek web", kirim ke POST /api/ai/ask (history 6 pesan terakhir).
   Jawaban sebagai teks tipografis (bukan gelembung chat), tautan sumber jika ada. Tampilkan
   pesan ramah saat code = "budget" atau "rate_limit".

Aturan: TypeScript strict, borderless, token yang ada, teks Indonesia, 390px dulu, target
sentuh >= 44px, reduced-motion. Build dan lint sebelum tiap commit, lalu ringkas.
