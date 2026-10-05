require('./typescript-loader.cjs');
const assert = require('node:assert/strict');
const { draftKey, readDraft, writeDraft } = require('../src/lib/offline');
const { apiFetch, ApiError, uploadDocument, takeWakeReturn } = require('../src/lib/api');
const localStorage = {}, sessionStorage = {};
for (const store of [localStorage, sessionStorage]) {
  Object.defineProperties(store, {
    getItem: {value: key => store[key] ?? null},
    setItem: {value: (key, value) => { store[key] = value; }},
    removeItem: {value: key => { delete store[key]; }},
  });
}
let redirects = 0;
global.window = {localStorage, sessionStorage,
  location: {pathname: '/agents/study', origin: 'https://fareeqai.pages.dev', assign: () => { redirects++; }}};
(async () => {
  const alice = draftKey('alice', 'study', null);
  const bob = draftKey('bob', 'study', null);
  writeDraft(alice, 'Private unfinished thought');
  assert.equal(readDraft(bob), '', 'another account cannot restore the draft');
  localStorage['fareeq.draft.study.new'] = 'Legacy private draft';
  localStorage['ui-preference'] = 'keep';
  sessionStorage['fareeq.handoff'] = 'Private quoted reply';
  global.fetch = async url => url.endsWith('/auth/status') ? Response.json({guest_enabled: false}) : new Response('', {status: 401});
  await assert.rejects(apiFetch('/users/me'), ApiError);
  assert.equal(readDraft(alice), '');
  assert.equal(localStorage['fareeq.draft.study.new'], undefined);
  assert.equal(sessionStorage['fareeq.handoff'], undefined);
  assert.equal(localStorage['ui-preference'], 'keep');
  assert.equal(redirects, 1);
  window.location.pathname = '/login';
  writeDraft(alice, 'Private thought from another tab');
  global.fetch = async () => Response.json({signed_in: false, two_factor_required: true});
  await apiFetch('/auth/login');
  assert.equal(readDraft(alice), 'Private thought from another tab');
  global.fetch = async () => Response.json({signed_in: true});
  await apiFetch('/auth/login');
  assert.equal(readDraft(alice), '');
  window.location.pathname = '/';
  let guestCalls = 0, signedIn = false;
  global.fetch = async url => {
    if (url.endsWith('/auth/status')) return Response.json({guest_enabled: true});
    if (url.endsWith('/auth/guest')) { guestCalls++; await new Promise(resolve => setTimeout(resolve, 10)); signedIn = true; return Response.json({signed_in: true}); }
    return signedIn ? Response.json({id: 'isolated-guest'}) : new Response('', {status: 401});
  };
  const results = await Promise.all([apiFetch('/users/me'), apiFetch('/goals')]);
  assert.equal(guestCalls, 1, 'concurrent requests share a guest bootstrap');
  assert.equal(results[0].id, 'isolated-guest');
  assert.equal(redirects, 1, 'guest access never sends visitors to login');
  signedIn = false;
  global.fetch = async url => url.endsWith('/auth/status') ? Response.json({guest_enabled: true}) : new Response('', {status: url.endsWith('/auth/guest') ? 429 : 401});
  await assert.rejects(apiFetch('/users/me'), error => error.status === 429);
  assert.equal(redirects, 1, 'an unavailable guest session shows an error instead of forcing login');
  global.fetch = async () => new Response('', {status: 503, headers: {'X-Fareeq-Wake': '1'}});
  await assert.rejects(apiFetch('/users/me'), error => error.status === 503);
  assert.equal(redirects, 2, 'cold hosting opens a real browser wake page');
  await assert.rejects(apiFetch('/users/me'), error => error.status === 503);
  assert.equal(redirects, 2, 'a failing wake cannot create a redirect loop');
  sessionStorage.removeItem('fareeq.wake.at');
  window.location.pathname = '/agents/study';
  let uploads = 0;
  global.XMLHttpRequest = class {
    upload = {};
    status = 503;
    responseText = '{}';
    open() {}
    getResponseHeader(name) { return name === 'X-Fareeq-Wake' ? '1' : null; }
    send() { uploads++; queueMicrotask(() => this.onload()); }
  };
  await assert.rejects(uploadDocument(new File(['synthetic text'], 'check.txt'), 'study').promise,
    error => error.status === 503);
  assert.equal(uploads, 1, 'cold upload is not replayed');
  assert.equal(redirects, 3, 'uploads share the real visitor wake');
  assert.equal(sessionStorage['fareeq.wake.return'], '/agents/study');
  sessionStorage.removeItem('fareeq.wake.at');
  window.location.pathname = '/login';
  await assert.rejects(apiFetch('/auth/login', {method: 'POST'}), error => error.status === 503);
  assert.equal(redirects, 4, 'optional sign-in can wake too without replaying credentials');
  assert.equal(sessionStorage['fareeq.wake.return'], '/login');
  sessionStorage.removeItem('fareeq.wake.at');
  window.location.pathname = '/privacy';
  await assert.rejects(apiFetch('/auth/status'), error => error.status === 503);
  assert.equal(redirects, 4, 'privacy remains readable while the backend sleeps');
  for (const invalid of ['javascript:alert(1)', 'https://other.example/', '//other.example/x', 'https://fareeqai.pages.dev//other.example/x']) {
    sessionStorage.setItem('fareeq.wake.return', invalid);
    assert.equal(takeWakeReturn(), null, 'unsafe return state refused');
  }
  sessionStorage.setItem('fareeq.wake.return', '/agents/study?c=synthetic');
  assert.equal(takeWakeReturn(), '/agents/study?c=synthetic');
  assert.equal(takeWakeReturn(), null, 'return state consumed once');
  console.log('PASS: cold upload/auth recovery, safe return route and no automatic replay.');
  console.log('PASS: account-scoped drafts; 401/login clear private drafts and handoff; UI preferences survive.');
})().catch(error => {console.error(error); process.exitCode = 1;});
