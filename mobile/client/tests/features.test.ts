import test from 'node:test';
import assert from 'node:assert/strict';
import { targetDate } from '../src/features/tracking.ts';
import { MAX_DOCUMENT_BYTES, validateDocument, toggleAttachment, UploadTask, type Document } from '../src/features/documents.ts';
import { markdownBlocks, markdownInline, safeLink } from '../src/utils/markdown.ts';
test('target dates reject rollover, malformed dates and invalid leap years', () => {
  assert.equal(targetDate(''), null); assert.equal(targetDate('2028-02-29'), '2028-02-29T12:00:00.000Z');
  for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '10/08/26', '2026-01-01T00:00:00Z']) assert.throws(() => targetDate(value));
});
test('upload limits reject empty, unknown, oversized and non-document files', () => {
  validateDocument('résumé.PDF', MAX_DOCUMENT_BYTES); validateDocument('notes.md', 1);
  for (const size of [0, -1, NaN, Infinity, MAX_DOCUMENT_BYTES + 1]) assert.throws(() => validateDocument('notes.txt', size));
  assert.throws(() => validateDocument('document.exe', 100)); assert.throws(() => validateDocument('document.pdf.exe', 100));
});
test('only ready files can attach and attachment limit does not block removal', () => {
  const doc = { id: 'six', status: 'ready' } as Document;
  const five = ['one', 'two', 'three', 'four', 'five'];
  assert.throws(() => toggleAttachment(five, doc));
  assert.deepEqual(toggleAttachment([...five, 'six'], doc), five);
  assert.throws(() => toggleAttachment([], { ...doc, status: 'processing' }));
  assert.throws(() => toggleAttachment([], { ...doc, status: 'failed' }));
  assert.deepEqual(toggleAttachment([], doc), ['six']);
});
test('Markdown preserves Arabic, fenced code, lists, headings and table rows', () => {
  const blocks = markdownBlocks('# خطة\n\n1. خطوة\n```js\nconst x = "<script>";\n```\n| Name | Value |\n| --- | --- |\n| A | 2 |');
  assert.equal(blocks[0].kind, 'heading'); assert.equal(blocks[0].text, 'خطة');
  assert.equal(blocks[1].marker, '1.'); assert.equal(blocks[2].text, 'const x = "<script>";');
  assert.deepEqual(blocks[3].rows, [['Name', 'Value'], ['A', '2']]);
  assert.equal(markdownBlocks('```\nunclosed code')[0].text, 'unclosed code');
});
test('Markdown links only open HTTP(S), never scripts, files, native intents or credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/private', 'intent://example', 'https://user:pass@example.com']) assert.equal(safeLink(url), null);
  assert.equal(safeLink('https://example.com/help'), 'https://example.com/help');
  const inline = markdownInline('**Bold** `code` [Unsafe](javascript:run) [Safe](https://example.com)');
  assert.equal(inline.find(part => part.text === 'Unsafe')?.url, undefined);
  assert.equal(inline.find(part => part.text === 'Safe')?.url, 'https://example.com/');
  assert.equal(markdownInline('<script>alert(1)</script>')[0].text, '<script>alert(1)</script>');
});

test('Android picker background does not cancel selection, but background during transfer aborts', () => {
  const task = new UploadTask(); task.background(); assert.equal(task.signal.aborted, false);
  assert.equal(task.startUpload(), true); task.background(); assert.equal(task.signal.aborted, true);
});
test('closing a picker or changing accounts prevents a later selection from uploading', () => {
  const task = new UploadTask(); task.abort(); assert.equal(task.startUpload(), false);
});
