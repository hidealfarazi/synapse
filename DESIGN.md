# DESIGN.md — Direction (Quiet Grotesk / Rainy Night)

Bold, calm, personal, borderless. Deep near-black, giant grotesk type, single steel-blue accent, dynamic rain atmosphere.

## Tokens
- bg: `#0B0D10` (deep ink black)
- text: `#F2F2EE` (off-white)
- muted: `#8B93A0` (cool slate grey)
- accent: `#8FA3BF` (single steel-blue accent)
- amber: `#E3B87A` (due within 4 hours)
- alert: `#D9776B` (due within 1 hour)

## Typography
- Display / Headings: `Space Grotesk` (700/800 bold, clamp responsive)
- Body: `Geist` (16px+)
- Labels & Times: `Geist Mono` (one consistent uppercase mono pattern)

## Borderless Rules
- Konten tetap BORDERLESS (tanpa kartu/kotak). Kontrol interaktif (tombol, chip, kolom input) BOLEH berupa kotak bersudut membulat 12px dengan keadaan hover/fokus/aktif yang jelas.
- Separation achieved with whitespace, large confident type, and single 1px hairline rules (`rgba(143, 163, 191, 0.15)` or `rgba(139, 147, 160, 0.2)`).
- Full-width text rows. 
- Progress shown via Comet Dial (read-only, mono numbers).
- React Bits components must have transparent background, 0 radius, no shadows.

## Mobile First
- Primary viewport: 390px.
- Touch targets >= 44px.
- Content max-width 36rem centered on desktop.
- Respects `prefers-reduced-motion`.

## Auth & Atmosfer
- Login lewat `/login` (email + kata sandi, Supabase). Gerbang halaman di `proxy.ts`, gerbang data di RLS (`supabase/migrations`).
- Semua data per akun lewat `lib/repo.ts`; akun baru mulai kosong (empty state, bukan data contoh).
- Halaman selain Hari Ini: hujan tipis (`RainLayer`), 1px, opasitas <= 0.2, berhenti saat tab tersembunyi/reduced-motion/toggle mati.
