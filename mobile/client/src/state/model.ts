import type { Source } from '../features/documents';
export interface Message { id: string; role: 'user' | 'assistant'; content: string; saved?: boolean; completion?: string; notice?: string; attachments?: { id: string; filename: string }[]; sources?: Source[] }
export interface Chat { id: string; agentId: string; title: string; messages: Message[] }
export interface Workspace { chats: Chat[]; drafts: Record<string, string> }
export type Action = { type: 'replace'; chats: Chat[] } | { type: 'upsert'; chat: Chat } | { type: 'clear' } | { type: 'draft'; agentId: string; text: string } | { type: 'send'; chatId: string; agentId: string; text: string; turnId: string } | { type: 'save'; chatId: string; messageId: string };
export const sampleReply = 'This is a sample reply for the design preview. Your message stays on this device during this preview; live AI is not connected yet.';
export const initialWorkspace: Workspace = { drafts: {}, chats: [{ id: 'sample-interview', agentId: 'career', title: 'Interview prep', messages: [
  { id: 'sample-user', role: 'user', content: 'I have an interview tomorrow. Help me prepare.' },
  { id: 'sample-assistant', role: 'assistant', content: 'Let’s turn nerves into a plan.\n\n1. Your 60-second introduction\nA clear summary of who you are and what you bring.\n\n2. Two stories that show your impact\nUse the STAR method to highlight real results.\n\n3. Questions worth asking\nThoughtful questions show curiosity and help you find the right fit.' },
] }] };
export function workspaceReducer(state: Workspace, action: Action): Workspace {
  if (action.type === 'clear') return { chats: [], drafts: {} };
  if (action.type === 'replace') return { ...state, chats: action.chats };
  if (action.type === 'upsert') return { ...state, chats: [action.chat, ...state.chats.filter(chat => chat.id !== action.chat.id)] };
  if (action.type === 'draft') return { ...state, drafts: { ...state.drafts, [action.agentId]: action.text } };
  if (action.type === 'save') return { ...state, chats: state.chats.map(chat => chat.id !== action.chatId ? chat : { ...chat, messages: chat.messages.map(message => message.id === action.messageId && message.role === 'assistant' ? { ...message, saved: !message.saved } : message) }) };
  const text = action.text.trim();
  if (!text) return state;
  const existing = state.chats.find(chat => chat.id === action.chatId);
  if (existing && existing.agentId !== action.agentId) return state;
  if (existing?.messages.some(message => message.id === `${action.turnId}-user`)) return state;
  const chat: Chat = existing ?? { id: action.chatId, agentId: action.agentId, title: text.slice(0, 60), messages: [] };
  const updated = { ...chat, messages: [...chat.messages, { id: `${action.turnId}-user`, role: 'user' as const, content: text }, { id: `${action.turnId}-assistant`, role: 'assistant' as const, content: sampleReply }] };
  return { chats: [updated, ...state.chats.filter(item => item.id !== chat.id)], drafts: { ...state.drafts, [action.agentId]: '' } };
}
