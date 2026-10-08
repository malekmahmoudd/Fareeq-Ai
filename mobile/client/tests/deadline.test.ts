import test from 'node:test';
import assert from 'node:assert/strict';
import { ConnectionTimeout, withDeadline } from '../src/api/deadline.ts';

test('an unresponsive transport is aborted and fails without retrying', async () => {
  let calls = 0;
  let transportSignal: AbortSignal | undefined;
  await assert.rejects(withDeadline(signal => {
    calls++; transportSignal = signal;
    return new Promise(() => {});
  }, 10), ConnectionTimeout);
  assert.equal(transportSignal?.aborted, true);
  assert.equal(calls, 1);
});
test('caller cancellation aborts an in-flight request immediately', async () => {
  const parent = new AbortController();
  let transportSignal: AbortSignal | undefined;
  const pending = withDeadline(signal => {
    transportSignal = signal;
    return new Promise(() => {});
  }, 10000, parent.signal);
  parent.abort();
  await assert.rejects(pending, /cancelled/);
  assert.equal(transportSignal?.aborted, true);
});
test('already-cancelled requests never reach the transport', async () => {
  const parent = new AbortController(); parent.abort();
  let called = false;
  await assert.rejects(withDeadline(async () => { called = true; }, 100, parent.signal), /cancelled/);
  assert.equal(called, false);
});
test('successful requests return normally and remove the timeout', async () => {
  let transportSignal: AbortSignal | undefined;
  assert.equal(await withDeadline(async signal => { transportSignal = signal; return 'ok'; }, 10), 'ok');
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(transportSignal?.aborted, false);
});
