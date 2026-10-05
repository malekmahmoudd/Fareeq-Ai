const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const source = fs.readFileSync(require('node:path').join(__dirname, '../netlify/edge-functions/api.js'), 'utf8');
  const { default: proxy } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const original = { fetch: global.fetch, setTimeout: global.setTimeout, clearTimeout: global.clearTimeout };
  const timers = new Map(); let nextTimer = 0;
  global.setTimeout = cb => { const id = ++nextTimer; timers.set(id, cb); return id; };
  global.clearTimeout = id => timers.delete(id);
  global.Netlify = { env: { get: () => 'https://fareeqai-api.onrender.com' } };
  try {
    let received, upstreamBody;
    const stream = new ReadableStream({ start(controller) { upstreamBody = controller; controller.enqueue(new TextEncoder().encode('data: first\n\n')); } });
    global.fetch = async (url, options) => {
      received = { url, options };
      const headers = new Headers({ 'Content-Type': 'text/event-stream' });
      headers.append('Set-Cookie', 'session=synthetic; HttpOnly; Secure; SameSite=Strict; Path=/api');
      return new Response(stream, { headers });
    };
    const requestAbort = new AbortController();
    const reply = await proxy(new Request('https://fareeqai.netlify.app/api/agents/study/chat/stream?next=https://other.invalid', {
      method: 'POST', body: JSON.stringify({ message: 'hello' }), signal: requestAbort.signal,
      headers: { Origin: 'https://fareeqai.netlify.app', Cookie: 'session=synthetic', 'X-Forwarded-For': 'spoofed' },
    }));
    assert.equal(received.url.hostname, 'fareeqai-api.onrender.com');
    assert.equal(received.options.headers.get('Origin'), 'https://fareeqai.netlify.app');
    assert.equal(received.options.headers.get('Cookie'), 'session=synthetic');
    assert.equal(received.options.headers.get('X-Forwarded-For'), null);
    assert.equal(received.options.redirect, 'manual');
    assert.match(reply.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Strict/);
    assert.equal(reply.headers.get('Cache-Control'), 'no-store');
    const reader = reply.body.getReader();
    assert.match(new TextDecoder().decode((await reader.read()).value), /first/);
    assert.equal(timers.size, 0, 'header deadline must not remain armed during SSE');
    upstreamBody.enqueue(new TextEncoder().encode('data: later\n\n')); upstreamBody.close();
    assert.match(new TextDecoder().decode((await reader.read()).value), /later/);
    requestAbort.abort(); assert(received.options.signal.aborted);
    console.log('PASS: fixed upstream, Origin/cookie/secure Set-Cookie, incremental SSE, header-only deadline, cancellation');
    global.fetch = (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('synthetic-secret-not-for-response')), { once: true }));
    const waiting = proxy(new Request('https://fareeqai.netlify.app/api/auth/status'));
    for (const cb of timers.values()) cb();
    const unavailable = await waiting;
    assert.equal(unavailable.status, 503); assert.equal(unavailable.headers.get('Retry-After'), '10');
    assert(!(await unavailable.text()).includes('synthetic-secret'));
    global.Netlify.env.get = () => undefined;
    assert.equal((await proxy(new Request('https://fareeqai.netlify.app/api/auth/status'))).status, 503);
    console.log('PASS: bounded cold-start failure and missing configuration fail safely without error/secret echo');
  } finally { Object.assign(global, original); delete global.Netlify; }
})().catch(err => { console.error(err); process.exitCode = 1; });
