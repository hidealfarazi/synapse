# SPEC.md — Rainy Night

> Source of truth for features, data, and rules. Read this AND DESIGN.md before any task.
> Single user (the owner). Personal school + self-learning companion.

## 1. Goal
One app to (1) manage school assignments ("PR") with deadlines and progress checkpoints,
and (2) learn with AI help. Must feel deeply personal and good to use daily.

## 2. Stack
| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling / motion | Tailwind CSS, Framer Motion, Canvas (rain accents) |
| Backend | Supabase (Auth, Postgres, Storage) |
| AI | Anthropic API, called ONLY from server route handlers |
| Hosting | Vercel (PWA: installable, no offline needed) |
| Language | UI text mixed Indonesian/English |

## 3. MVP scope (target: 1 week)
Priority order: **PR management → AI integration**.

| Page | Route | MVP |
|---|---|---|
| 今日 Hari Ini | `/` | Yes |
| 課題 PR list | `/pr` | Yes |
| PR detail + checkpoints | `/pr/[id]` | Yes |
| AI Tutor | `/ai` | Yes |
| Lainnya (settings, low-power toggle, logout) | `/more` | Yes |

### Phase 2 (NOT in MVP; do not build yet)
Notes, flashcards, YouTube links, study tracker, 道 Skill Path (Three Tier Readiness map
with AI-suggested framework combos), Projects workspace (GitHub/YouTube integration),
weekly reflection, calendar/schedule, reminders.

## 4. Features (MVP)
### PR
- Create/edit/delete assignment: subject, title, description, due_at, priority (1-3), est_minutes.
- Subtasks (checklist). Progress (0-100) auto-derived from subtasks, manually overridable.
- Status: `todo | doing | done`.
- Checkpoints: timestamped note and/or image, shown as a vertical journey timeline
  ("where I stopped yesterday"). Image upload to private Storage bucket.
- "Hari ini & Besok" view on home: assignments due today/tomorrow, urgent ones glow warm.

### AI (server-side only)
| Kind | Behavior |
|---|---|
| `brief` | Reads today/tomorrow assignments, returns a calm 2-3 line plan and order of work |
| `analogy` | Explains a concept with an analogy first, code later |
| `hint` | Given an error/problem: name the misunderstood concept and likely location. NEVER give the full solution |
| `quiz` | 3 questions from supplied notes/topic, answers hidden until the user answers |

Rules: no full solutions in `hint` mode; keep replies short; respond in Indonesian unless asked.

## 5. Data model (Supabase)
```sql
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  priority smallint not null default 2 check (priority between 1 and 3),
  status text not null default 'todo' check (status in ('todo','doing','done')),
  progress smallint not null default 0 check (progress between 0 and 100),
  est_minutes int,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_type text not null check (parent_type in ('assignment','material')),
  parent_id uuid not null,
  kind text not null check (kind in ('step','bring','term')),
  title text not null,
  done boolean not null default false
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  created_at timestamptz not null default now()
);

create table checkpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references assignments(id) on delete cascade,
  note text,
  image_path text,
  created_at timestamptz not null default now()
);

create table ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  prompt text,
  response text,
  created_at timestamptz not null default now()
);
```

### Security (mandatory)
- Enable RLS on every table. Policy for each: `using (user_id = auth.uid()) with check (user_id = auth.uid())`.
- Storage bucket `checkpoints`: private; path prefix `{user_id}/...`; policy restricts to own prefix.
- Never expose the service role key or the AI key to the client.

## 6. AI route design
- Endpoint: `POST /api/ai` with `{ kind, input }`. Verify Supabase session first.
- Env vars (server only): `ANTHROPIC_API_KEY`, `AI_MODEL_FAST`, `AI_MODEL_SMART`.
  - Suggested: fast = `claude-haiku-4-5-20251001` (brief, quiz), smart = `claude-sonnet-5-5` (analogy, hint).
- Rate limit: max N requests/day per user (store counts in `ai_logs`); return a friendly error beyond it.
- Cap `max_tokens`; log every call to `ai_logs`.
- Stream responses to the UI when possible.

## 7. Rules for AI coding agents (Antigravity: Gemini Flash + Claude Sonnet)
- Read AGENTS.md, docs/SPEC.md, docs/DESIGN.md first. Do not build Phase 2 items.
- One task = one agent/model. Commit after each finished task on its own branch.
- **Claude Sonnet owns:** schema/RLS, auth, AI route, security review, tricky UI.
- **Gemini Flash owns:** repetitive CRUD, simple pages, refactors, lint/build fixes.
- Anything touching auth, RLS, storage policies, or API keys MUST be reviewed by Claude before merge.
- Never commit secrets. Use `.env.local` and Vercel env vars.
- Prefer small, reviewable changes; explain each new file briefly.

## 8. Build order (7 days)
1. Setup, tokens, background system, nav.  2. Supabase auth + tables + RLS.
3. PR CRUD, subtasks, progress.  4. Checkpoints (text + image), Hari Ini page.
5. AI route + brief + analogy.  6. AI quiz + hint + rate limit.  7. Polish, phone testing, deploy, PWA.

## 9. Definition of done (MVP)
- Works smoothly on a real phone and on laptop.
- RLS verified: a second account cannot read the first account's data.
- AI key not present in any client bundle.
- Low-power mode and reduced-motion respected.
- UI passes the DESIGN.md checklist.
