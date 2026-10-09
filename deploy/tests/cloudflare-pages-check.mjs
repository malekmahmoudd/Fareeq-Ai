import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../cloudflare-pages/_worker.js', import.meta.url), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
let seen;
globalThis.fetch = async (url, options) => {
  seen = { url: String(url), ...options };
  return new Response('data: streaming\n\n', { headers: {
    'content-security-policy': "script-src 'nonce-test'",
    'set-cookie': 'modeer_session=synthetic; Secure; HttpOnly; SameSite=Lax',
  } });
};
let response = await worker.fetch(new Request('https://fareeqai.pages.dev/login', {
  headers: { cookie: 'modeer_session=secret; fareeq_locale=ar; unknown=secret', authorization: 'Bearer secret' },
}));
assert.equal(seen.url, 'https://fareeqai.netlify.app/login');
assert.equal(seen.headers.get('cookie'), 'fareeq_locale=ar');
assert.equal(seen.headers.get('authorization'), null);
assert.equal(response.headers.get('set-cookie'), null);
assert.equal(response.headers.get('content-security-policy'), "script-src 'nonce-test'");
response = await worker.fetch(new Request('https://fareeqai.pages.dev/api/auth/login', {
  method: 'POST', body: '{}', headers: { origin: 'https://evil.invalid', cookie: 'modeer_session=synthetic', 'x-forwarded-for': 'spoof' },
}));
assert.equal(seen.url, 'https://fareeqai-api.dockhosting.dev/api/auth/login');
assert.equal(seen.headers.get('origin'), 'https://evil.invalid');
assert.equal(seen.headers.get('cookie'), 'modeer_session=synthetic');
assert.equal(seen.headers.get('x-forwarded-for'), null);
assert.match(response.headers.get('set-cookie'), /Secure; HttpOnly/);
assert.equal(await response.text(), 'data: streaming\n\n');
assert.equal(response.headers.get('cache-control'), 'no-store');
await worker.fetch(new Request('https://fareeqai.pages.dev//evil.invalid/path'));
assert.equal(new URL(seen.url).origin, 'https://fareeqai.netlify.app');
response = await worker.fetch(new Request('https://preview.fareeqai.pages.dev/api/auth/account'));
assert.equal(response.status, 403);
response = await worker.fetch(new Request('https://preview.fareeqai.pages.dev/login'));
assert.equal(response.headers.get('location'), 'https://fareeqai.pages.dev/login');
globalThis.fetch = async () => { throw new Error('secret-provider-credential'); };
response = await worker.fetch(new Request('https://fareeqai.pages.dev/api/health'));
assert.equal(response.status, 503);
assert.ok(!(await response.text()).includes('secret-provider-credential'));
globalThis.fetch = async () => new Response('<html>Host startup script</html>', {
  status: 503, headers: {'content-type': 'text/html', 'X-Blitz-Gate': 'starting'},
});
response = await worker.fetch(new Request('https://fareeqai.pages.dev/api/auth/status'));
assert.equal(response.status, 503);
assert.equal(response.headers.get('X-Fareeq-Wake'), '1');
assert.match(response.headers.get('content-type'), /application\/json/);
assert.ok(!(await response.text()).includes('<html>'));
console.log('Pages transport: credential isolation, origin preservation, cookie/stream passthrough, fixed upstream, preview refusal and error redaction passed.');

let assetsSeen = [];
const env = { ASSETS: { fetch: async request => {
  const path = new URL(request.url).pathname;
  assetsSeen.push(path);
  return new Response(path === '/mobile/' ? 'Expo shell' : 'missing', { status: path === '/mobile/' ? 200 : 404 });
} } };
response = await worker.fetch(new Request('https://fareeqai.pages.dev/mobile'), env);
assert.equal(response.headers.get('location'), 'https://fareeqai.pages.dev/mobile/');
response = await worker.fetch(new Request('https://fareeqai.pages.dev/mobile/agents/career'), env);
assert.equal(await response.text(), 'Expo shell');
assert.deepEqual(assetsSeen, ['/mobile/agents/career', '/mobile/']);
response = await worker.fetch(new Request('https://fareeqai.pages.dev/mobile/missing.js'), env);
assert.equal(response.status, 404, 'missing scripts never receive the HTML fallback');
response = await worker.fetch(new Request('https://preview.fareeqai.pages.dev/mobile/'), env);
assert.equal(response.status, 307, 'mobile previews stay on the canonical auth origin');
response = await worker.fetch(new Request('https://fareeqai.pages.dev/mobile/', { method:'POST' }), env);
assert.equal(response.status, 405);
console.log('Separate Safari client: scoped assets, deep links, missing asset 404 and canonical origin passed.');
