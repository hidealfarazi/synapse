# Integrasi AI (Gemini) - lokal dulu

1. Buat kunci di Google AI Studio. Isi `.env.local` dari `.env.example`. Tambahkan `.data/` dan `.env*.local` ke `.gitignore`.
2. Salin folder `lib/ai/` dan `app/api/ai/` ke proyek. Alias `@/` harus aktif.
3. Cek nama model di AI Studio; ubah GEMINI_MODEL bila `gemini-3.7-flash` tidak dikenali.
4. Uji (PowerShell), setelah `npm run dev`:
   - Radar:      Invoke-RestMethod http://localhost:3000/api/ai/radar
   - Cek mingguan: Invoke-RestMethod -Method Post -ContentType application/json -Body '{"action":"refresh"}' http://localhost:3000/api/ai/radar
   - Rekomendasi: Invoke-RestMethod -Method Post -ContentType application/json -Body '{"tasks":[{"subject":"Basis Data","title":"Diagram ERD","dueInHours":3}],"doneTopics":[]}' http://localhost:3000/api/ai/recommend
   - Tanya:      Invoke-RestMethod -Method Post -ContentType application/json -Body '{"question":"Apa bedanya let dan const?","mode":"analogy"}' http://localhost:3000/api/ai/ask
5. JANGAN deploy ke Vercel sebelum: (a) guard.ts diganti cek login Supabase, (b) cache.ts diganti Supabase
   (sistem file Vercel tidak permanen).
