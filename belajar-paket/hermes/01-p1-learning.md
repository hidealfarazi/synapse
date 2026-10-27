Cabang `hermes/p1-learning`. Baca AGENTS.md dan docs/. Hasil sebelumnya dipertahankan.
Kerjakan SATU per SATU, build + lint + commit tiap nomor. Semua konten belajar pakai DATA
CONTOH (mock) di lib/mock/ dan lib/repo.ts. JANGAN panggil API AI, JANGAN pasang SDK AI,
JANGAN sentuh .env/Supabase/auth, JANGAN ubah lib/ai/ atau app/api/ai/. JANGAN mengubah
hero Hari Ini (itu sesi berikutnya).

1. PERAPIAN: hapus label ganda di Hari Ini ("02 / 03 - HARI INI" vs "HARI INI 2"; sisakan
   judul grup bertanda jumlah). Penghitung halaman jadi "01 / 04" sampai "04 / 04" sesuai
   4 tab. Tambah padding bawah konten agar baris terakhir tidak tertutup dock. Matikan
   indikator dev Next.js (devIndicators: false di next.config).
2. IDENTITAS MAPEL: tiap mata pelajaran punya warna redup (5 warna dari palet gelap: biru-abu,
   hijau pudar, ungu pudar, amber redup, rose pudar) berupa garis vertikal 2px kecil di depan
   label mapel. Bukan blok latar.
3. STRIP MINGGUAN: di Hari Ini setelah daftar tugas, strip 7 hari (Sen-Min) berisi jumlah
   tenggat per hari sebagai titik/angka mono kecil; hari ini ditandai garis bawah. Tanpa kotak.
4. BELAJAR (/belajar) dengan header seragam dan 4 bagian:
   01 Fokus hari ini: satu topik besar (judul, alasan 1 kalimat, label tingkat
      Fondasi/Kompetensi/AI, estimasi menit, 3 checkpoint pakai komponen Checklist, teks aksi
      "Mulai sesi"). Data contoh dari lib/mock/learning.ts, disimpan sekali per hari lewat
      lib/repo.ts (kunci tanggal); teks aksi "Perbarui".
   02 Jalurmu: peta vertikal tipis 3 tingkat dengan node dan garis penghubung.
      Tier 1 Fondasi: Computational thinking, Critical thinking, Spec-driven thinking,
      Dasar pemrograman. Tier 2 Kompetensi: System design, Optimasi dasar, Keamanan dan
      privasi, Value translator, Version control dan dokumentasi. Tier 3 AI Engineering:
      Model LLM dan API, Prompt engineering, RAG, Multimodal. Node bisa ditandai selesai
      (simpan lewat repo). Node aktif memakai Comet Dial kecil. Tanpa kartu.
   03 Minta sendiri: input garis-bawah "Aku mau belajar..." + tautan teks cepat
      ("Jelaskan pakai analogi", "Kuis aku", "Kasih petunjuk, jangan jawabannya").
      Untuk sekarang hanya UI (belum memanggil apa pun).
   04 Materiku: daftar materi yang ada dengan Comet Dial kecil.
5. SESI BELAJAR /belajar/sesi/[id], 4 langkah satu per layar dengan indikator "1 / 4":
   (a) Analogi dulu (teks contoh), (b) Istilah/Checkpoint dengan Checklist (Spring Check),
   (c) Kuis 3 soal pilihan ganda, jawaban dan penjelasan baru terbuka setelah dijawab,
   (d) Refleksi satu kalimat; saat selesai simpan sebagai checkpoint materi dan kembali ke
   Belajar. Hanya UI dan data contoh.

Aturan: TypeScript strict (tanpa any/ts-ignore), borderless (tanpa kartu/kotak/glow/kaca),
token warna dan font yang ada kecuali 5 warna mapel, teks Indonesia, tanggal dinamis, mobile
first 390px, target sentuh >= 44px, hormati reduced-motion, akses data hanya lewat lib/repo.ts.
Akhiri tiap nomor dengan ringkasan dan hal yang diragukan.
