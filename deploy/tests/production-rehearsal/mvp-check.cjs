/* Targeted MVP regression. Loopback, disposable accounts, scripted upstream.
   This is deliberately not evidence of a real production deployment/provider. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = 'https://localhost:8443';
const results = { environment: 'local rehearsal; scripted provider', checks: [] };
const check = name => { results.checks.push(name); console.log('PASS', name); };
async function signIn(page, key) {
  await page.goto(base + '/login');
  await page.getByRole('button', { name: 'Have an invitation key? Use it instead' }).click();
  await page.getByLabel('Access key').fill(key);
  await page.getByRole('button', { name: 'Meet your team' }).click();
  await page.waitForURL(base + '/');
}
(async () => {
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  results.browser = browser.version();
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await signIn(page, 'q'.repeat(40));
    const cookie = (await context.cookies()).find(c => c.httpOnly);
    assert(cookie && cookie.secure && cookie.sameSite === 'Strict');
    check('HTTPS login uses secure HttpOnly SameSite=Strict cookie');
    await page.goto(base + '/agents/study?compose=1');
    await page.locator('textarea').fill('Private draft belonging to account A');
    await page.waitForFunction(() => Object.keys(localStorage).some(k => k.startsWith('fareeq.draft.v2.') && localStorage[k].includes('Private draft')));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('textarea')?.value === 'Private draft belonging to account A');
    check('account-scoped private draft survives reload');
    const upload = await context.request.post(base + '/api/documents', {
      headers: { Origin: base }, multipart: { agent_id: 'study', file: { name: 'mvp-probe.md', mimeType: 'text/markdown', buffer: Buffer.from('# Cedar Lantern\nThe Cedar Lantern project deadline is December 17. The project budget is 340 dollars.') } }
    });
    assert.equal(upload.status(), 202);
    const doc = await upload.json();
    let ready;
    for (let i = 0; i < 40; i++) {
      ready = await (await context.request.get(base + '/api/documents/' + doc.id)).json();
      if (ready.status !== 'processing') break;
      await page.waitForTimeout(250);
    }
    assert.equal(ready.status, 'ready');
    assert(ready.chunks > 0);
    const reply = await context.request.post(base + '/api/agents/study/chat/stream', {
      headers: { Origin: base }, data: { message: 'According to mvp-probe.md, when is the Cedar Lantern project deadline?' }
    });
    assert.equal(reply.status(), 200);
    const frames = (await reply.text()).split('\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
    const answer = frames.find(frame => frame.type === 'start');
    assert(answer, 'stream contains a start frame');
    assert(frames.some(frame => frame.type === 'end' && frame.completion === 'completed'), 'stream completes successfully');
    assert(answer.context.documents.some(d => d.filename === 'mvp-probe.md'));
    const conversation = answer.conversation_id;
    const history = await (await context.request.get(base + '/api/conversations/' + conversation)).json();
    assert(history.messages.length >= 2);
    check('document reaches ready, passages reach provider context, conversation persists');
    await page.evaluate(() => {
      localStorage.setItem('fareeq.draft.legacy', 'Legacy private draft');
      sessionStorage.setItem('fareeq.handoff', 'Private quoted reply');
    });
    assert.equal((await context.request.post(base + '/api/auth/logout', { headers: { Origin: base } })).status(), 200);
    await page.reload();
    await page.waitForURL(/\/login/);
    assert(await page.evaluate(() => !Object.keys(localStorage).some(k => k.startsWith('fareeq.draft.')) && !sessionStorage.getItem('fareeq.handoff')));
    check('expired session clears scoped and legacy drafts plus handoff before login');
    await signIn(page, 'r'.repeat(40));
    await page.goto(base + '/agents/study?compose=1');
    await page.locator('textarea').waitFor();
    assert.equal(await page.locator('textarea').inputValue(), '');
    assert.equal((await context.request.get(base + '/api/documents/' + doc.id)).status(), 404);
    assert.equal((await context.request.get(base + '/api/conversations/' + conversation)).status(), 404);
    check('second account cannot see first account draft, document or conversation');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('mobile-width chat has no horizontal overflow');
    const invalid = await context.request.post(base + '/api/auth/login', { headers: { Origin: base }, data: { access_key: 'synthetic-secret-no-echo', email: 'x@example.invalid', password: 'synthetic-password' } });
    assert.equal(invalid.status(), 422);
    assert(!(await invalid.text()).includes('synthetic-secret-no-echo'));
    check('credential validation does not echo submitted secret');
    await context.request.post(base + '/api/auth/logout', { headers: { Origin: base } });
    await signIn(page, 'q'.repeat(40));
    assert.equal((await context.request.get(base + '/api/documents/' + doc.id)).status(), 200);
    assert.equal((await context.request.get(base + '/api/conversations/' + conversation)).status(), 200);
    assert.deepEqual(errors, []);
    check('account data persists across logout and login; no browser runtime errors');
  } finally {
    fs.writeFileSync(process.env.REHEARSAL_REPORT || 'mvp-rehearsal-results.json', JSON.stringify(results, null, 2) + '\n');
    await browser.close();
  }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
