import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreSession } from '../src/api/session.ts';
const missing = { status: 401 };
const unauthorized = (error: unknown) => error === missing;
test('first guest entry clears the expired workspace before creating and returning a usable session', async () => {
  const order: string[] = []; let reads = 0;
  const me = await restoreSession(async () => { order.push('read'); if (++reads === 1) throw missing; return { id: 'new-guest' }; }, async () => { order.push('guest'); }, unauthorized, () => order.push('clear'));
  assert.equal(me.id, 'new-guest'); assert.deepEqual(order, ['read', 'clear', 'guest', 'read']);
});
test('an authenticated session never creates another guest or clears the workspace', async () => {
  const me = await restoreSession(async () => ({ id: 'account' }), async () => { assert.fail('unexpected guest'); }, unauthorized, () => assert.fail('unexpected clear'));
  assert.equal(me.id, 'account');
});
test('connection failures and guest refusal are surfaced without replaying requests', async () => {
  let attempts = 0; const offline = new Error('offline');
  await assert.rejects(restoreSession(async () => { throw offline; }, async () => { attempts++; }, unauthorized, () => assert.fail('unexpected clear')), /offline/);
  assert.equal(attempts, 0);
  await assert.rejects(restoreSession(async () => { throw missing; }, async () => { attempts++; throw new Error('guest limit'); }, unauthorized, () => {}), /guest limit/);
  assert.equal(attempts, 1);
});
