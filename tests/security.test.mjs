import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

test('AI routes must reject requests unless server has explicit auth', () => {
  const guard = read('lib/ai/guard.ts');
  assert.match(guard, /if \(!owner\)/);
  assert.match(guard, /return Response\.json\(\{ error: "Tidak diizinkan\." \}, \{ status: 401 \}\)/);
});

test('AI endpoints refuse production without persistent quota storage', () => {
  const cache = read('lib/ai/cache.ts');
  assert.match(cache, /NODE_ENV === "production"/);
  assert.match(cache, /AI storage is not configured/);
});
test('AI endpoints require persistent quota storage before generating', () => {
  const guard = read('lib/ai/guard.ts');
  assert.match(guard, /assertAiStorage\(\)/);
});

test('pages are gated by proxy except login and auth callback', () => {
  const proxy = read('lib/supabase/proxy.ts');
  assert.match(proxy, /PUBLIC_PATHS = \["\/login", "\/auth\/callback"\]/);
  assert.match(proxy, /getClaims\(\)/);
  assert.match(read('proxy.ts'), /updateSession/);
});

test('every data table has RLS enabled and an owner-only policy', () => {
  const sql = read('supabase/migrations/20261026000000_account_data.sql');
  for (const t of ['assignments', 'materials', 'checklist_items', 'checkpoints', 'learning_focus', 'skill_nodes', 'recommendations']) {
    assert.match(sql, new RegExp(`alter table public\\.${t}\\s+enable row level security`));
    assert.match(sql, new RegExp(`create policy account_only on public\\.${t}\\s+for all to authenticated`));
    assert.match(sql, new RegExp(`create unique index if not exists \\w+\\s+on public\\.${t}\\(user_id, id\\)`));
  }
});

test('client code never references service role or secret keys', () => {
  for (const f of ['lib/supabase/client.ts', 'lib/supabase/config.ts', 'lib/repo.ts', 'components/LoginForm.tsx']) {
    assert.doesNotMatch(read(f), /service_role|SERVICE_ROLE|sb_secret/);
  }
});

test('auth callback only redirects to internal paths', () => {
  assert.match(read('app/auth/callback/route.ts'), /startsWith\("\/"\) && !next\.startsWith\("\/\/"\)/);
});
