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
  const proxy = read('lib/firebase/proxy.ts');
  assert.match(proxy, /PUBLIC_PATHS = \["\/login", "\/auth\/callback"\]/);
  assert.match(read('proxy.ts'), /updateSession/);
});

test('firestore has owner-only rules enabled', () => {
  const rules = read('firestore.rules');
  assert.match(rules, /match \/users\/\{userId\}\/\{document=\*\*\}/);
  assert.match(rules, /allow read, write: if request\.auth != null && request\.auth\.uid == userId/);
});

test('client code never references service role or secret keys', () => {
  for (const f of ['lib/firebase/client.ts', 'lib/firebase/config.ts', 'lib/repo.ts', 'components/LoginForm.tsx']) {
    assert.doesNotMatch(read(f), /service_role|SERVICE_ROLE|sb_secret|private_key/);
  }
});

test('auth callback only redirects to internal paths', () => {
  assert.match(read('app/auth/callback/route.ts'), /startsWith\("\/"\) && !next\.startsWith\("\/\/"\)/);
});
