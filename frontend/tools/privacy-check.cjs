require('./typescript-loader.cjs');
const assert = require('node:assert/strict');
const { draftKey, readDraft, writeDraft } = require('../src/lib/offline');
const { apiFetch, ApiError } = require('../src/lib/api');
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
  location: {pathname: '/agents/study', assign: () => { redirects++; }}};
(async () => {
  const alice = draftKey('alice', 'study', null);
  const bob = draftKey('bob', 'study', null);
  writeDraft(alice, 'Private unfinished thought');
  assert.equal(readDraft(bob), '', 'another account cannot restore the draft');
  localStorage['fareeq.draft.study.new'] = 'Legacy private draft';
  localStorage['ui-preference'] = 'keep';
  sessionStorage['fareeq.handoff'] = 'Private quoted reply';
  global.fetch = async () => new Response('', {status: 401});
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
  console.log('PASS: account-scoped drafts; 401/login clear private drafts and handoff; UI preferences survive.');
})().catch(error => {console.error(error); process.exitCode = 1;});
