Cabang `hermes/home-recommendation`. Baca AGENTS.md dan docs/. Hasil sebelumnya dipertahankan.
Data CONTOH (mock) saja: JANGAN panggil API AI, JANGAN pasang SDK AI, JANGAN sentuh
.env/Supabase/auth, JANGAN ubah lib/ai/ atau app/api/ai/.

1. Data: gunakan tipe `Recommendation` dari "@/lib/ai/types" (import saja, jangan diubah).
   Buat lib/mock/recommendation.ts berisi getMockRecommendation() yang mengembalikan
   Recommendation contoh yang masuk akal (signalSource contoh jelas ditandai mock).
   Simpan lewat lib/repo.ts dengan kunci tanggal (sekali per hari); "Ganti topik" memilih
   salah satu alternatives tanpa memanggil apa pun.
2. Hari Ini, urutan baru: sapaan kecil (label mono) -> HERO REKOMENDASI -> blok "Berikutnya"
   (tugas paling mendesak + hitung mundur hidup jam:menit, update tiap menit) -> daftar tugas
   -> strip mingguan.
3. HERO REKOMENDASI: tinggi ~75svh. Label "Sinyal industri - minggu ini", judul topik sangat
   besar (clamp 3rem sampai 5.5rem; baris pertama putih, baris kedua biru-abu #8FA3BF), alasan
   1-2 kalimat, baris info mono (tingkat, estimasi menit), teks aksi "Mulai sesi" dan "Ganti
   topik", lalu tautan kecil "Sumber: <nama>" (target _blank, rel noopener) dengan keterangan
   "Saran AI, cek sumbernya" hanya bila signalSource ada. Video hujan tetap latar hero dan
   memudar saat scroll. Tech Text boleh dipasang pada judul topik (React Bits via MCP; jika
   MCP gagal, BERHENTI dan beri tahu; muat 390px; aria-label; reduced-motion = teks statis;
   tanpa efek hover di perangkat sentuh).
4. "Mulai sesi" menaut ke /belajar/sesi/[id] (jika belum ada, buat halaman sementara berisi
   judul topik).

Aturan: TypeScript strict, borderless, token yang ada, teks Indonesia, 390px dulu, target
sentuh >= 44px, reduced-motion, akses data hanya lewat lib/repo.ts. Build dan lint sebelum
tiap commit, lalu ringkas.
