import test from 'node:test';
import assert from 'node:assert/strict';
import { initialWorkspace, workspaceReducer } from '../src/state/model.ts';
test('agent drafts are isolated and only the sent draft clears', () => {
  let state = workspaceReducer(initialWorkspace, { type: 'draft', agentId: 'career', text: 'Interview' });
  state = workspaceReducer(state, { type: 'draft', agentId: 'study', text: 'Exam' });
  state = workspaceReducer(state, { type: 'send', chatId: 'new', agentId: 'career', text: 'Interview', turnId: 'one' });
  assert.equal(state.drafts.career, ''); assert.equal(state.drafts.study, 'Exam');
  assert.equal(state.chats[0].messages[1].role, 'assistant'); assert.match(state.chats[0].messages[1].content, /sample reply/);
});
test('existing conversation cannot receive another agent turn', () => {
  const state = workspaceReducer(initialWorkspace, { type: 'send', chatId: 'sample-interview', agentId: 'study', text: 'Cross agent', turnId: 'two' });
  assert.equal(state, initialWorkspace);
});
test('blank and duplicate turns do not create replies', () => {
  assert.equal(workspaceReducer(initialWorkspace, { type: 'send', chatId: 'blank', agentId: 'career', text: '  ', turnId: 'blank' }), initialWorkspace);
  const action = { type: 'send' as const, chatId: 'new', agentId: 'career', text: 'Hello', turnId: 'same' };
  const state = workspaceReducer(initialWorkspace, action);
  assert.equal(workspaceReducer(state, action), state);
});
test('saving targets only assistant reply and can be undone', () => {
  let state = workspaceReducer(initialWorkspace, { type: 'save', chatId: 'sample-interview', messageId: 'sample-user' });
  assert.equal(state.chats[0].messages[0].saved, undefined);
  state = workspaceReducer(state, { type: 'save', chatId: 'sample-interview', messageId: 'sample-assistant' });
  assert.equal(state.chats[0].messages[1].saved, true);
  state = workspaceReducer(state, { type: 'save', chatId: 'sample-interview', messageId: 'sample-assistant' });
  assert.equal(state.chats[0].messages[1].saved, false);
  assert.equal(initialWorkspace.chats[0].messages[1].saved, undefined);
});
