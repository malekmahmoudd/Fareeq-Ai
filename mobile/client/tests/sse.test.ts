import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SSEParser } from '../src/api/sse.ts';
test('SSE preserves split frames, CRLF, and multibyte text', () => {
  const parser = new SSEParser();
  const source = 'event: start\r\ndata: {"conversation_id":"123"}\r\n\r\nevent: delta\ndata: {"text":"مرحباً"}\n\nevent: end\ndata: {"completion":"completed"}\n\n';
  const events = [...source].flatMap(character => parser.push(character));
  assert.deepEqual(events.map(e => e.event), ['start', 'delta', 'end']);
  assert.equal(events[1].data.text, 'مرحباً');
});
test('SSE ignores comments and rejects malformed or unbounded data', () => {
  const parser = new SSEParser();
  assert.deepEqual(parser.push(': ping\n\n'), []);
  assert.throws(() => parser.push('data: nope\n\n'));
  assert.throws(() => new SSEParser().push('x'.repeat(2_000_001)));
});

test('FareeqAI data-only events use the type discriminator', () => {
  const events = new SSEParser().push('data: {"type":"delta","text":"hello"}\n\ndata: {"type":"end","content":"hello"}\n\n');
  assert.deepEqual(events.map(e => e.event), ['delta', 'end']);
});
