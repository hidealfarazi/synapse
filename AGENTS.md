# AGENTS.md — "Belajar" (personal school + learning app)

Single-user private app: manage school assignments (PR) with deadlines/progress/checkpoints,
plus AI-assisted learning. UI text is Indonesian. The owner is a vocational high-school
software student; he directs, AI agents write most code. Explain new files briefly.

## Read first
- docs/SPEC.md (features, Supabase schema, AI route, build order)
- docs/DESIGN.md (visual rules, tokens). Reference: app/globals.css, components/Today.tsx.
If a task conflicts with these docs, STOP and ask.

## Stack
Next.js App Router + TypeScript (strict), plain CSS classes prefixed `rn-` in app/globals.css
(Tailwind is installed but do not rely on it for new components), Supabase later, Vercel.

## Commands
- `npm run dev` | `npm run build` | `npm run lint`. Run build + lint before every commit.

## Git
- Never commit to main. Branch per task: `agent/<short-task>`. Small commits, clear messages.
- Never commit secrets. `.env*.local` stays gitignored.

## Hard rules
1. TypeScript strict. No `any`, no `// @ts-ignore`. Fix type errors properly.
2. Konten tetap BORDERLESS (tanpa kartu/kotak). Kontrol interaktif (tombol, chip, kolom input) BOLEH berupa kotak bersudut membulat 12px dengan keadaan hover/fokus/aktif yang jelas. Lihat DESIGN.md.
3. Use existing CSS variables and `rn-` classes. No new colors. No decorative effects.
4. Video hujan HANYA di hero halaman Hari Ini (memudar ke latar polos saat scroll).
   Halaman lain berlatar polos + video latar `components/RainLayer.tsx` (/video/login.mp4 untuk login,
   /video/pages.mp4 untuk lainnya; redup, ikut toggle Atmosfer Hujan & prefers-reduced-motion).
   Jangan menambah efek lain. Tanpa aksara Jawa, tulisan Jawa, motif batik, atau kanji.
5. Keep ALL data access behind `lib/repo.ts` (mock now, Supabase later). Pages never call a DB directly.
6. Do NOT touch auth, RLS, Supabase config, env files, or API keys unless the task explicitly says so.
7. AI/API keys only on the server (route handlers). Never in client code.
8. No new dependencies without saying why first.
9. Mobile first (390px), touch targets >= 44px, respect prefers-reduced-motion.
10. Dates: real dynamic dates, Indonesian locale. No fake placeholder data in final UI.
11. Folder lib/ai/ dan app/api/ai/ adalah backend AI milik pemilik. JANGAN diubah, dihapus,
    atau dipindah. Jangan membuat file lib/ai.ts (bentrok dengan folder lib/ai/). Data
    contoh/mock ditaruh di lib/mock/. Kunci API tidak boleh muncul di kode klien.
    
## Model roles (Antigravity)
- Claude Sonnet: schema/RLS, auth, AI route, security review, tricky UI.
- Gemini Flash: repetitive CRUD, simple pages, refactors, fixing build/lint errors.
- Security-related work by any model must be reviewed by Claude before merging.

## Definition of done (every task)
Build + lint pass, matches docs/DESIGN.md checklist, summary of files changed/skipped/unsure.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
