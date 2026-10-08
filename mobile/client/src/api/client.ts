import { fetch } from 'expo/fetch';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SSEParser, type StreamEvent } from './sse';
import { withDeadline } from './deadline';
import type { Chat } from '../state/model';
export const apiURL = process.env.EXPO_PUBLIC_SAMPLE_MODE === 'true' ? '' : (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
export const live = !!apiURL;
const native = Platform.OS !== 'web';
const storageKey = 'fareeqai.mobile.session';
let token: string | null = null;
let initialized = false;
let unauthorized: (() => void) | undefined;
export function observeUnauthorized(listener: () => void) { unauthorized = listener; return () => { unauthorized = undefined; }; }
function checkUnauthorized(status: number, path: string) {
  if (status === 401 && !path.startsWith('/auth/')) unauthorized?.();
}
function secureEndpoint() {
  if (!__DEV__ && !apiURL.startsWith('https://')) throw new Error('A secure HTTPS backend is required for release builds.');
}
export class APIError extends Error { constructor(public status: number, message: string) { super(message); } }
async function headers() {
  if (native && !initialized) { token = await SecureStore.getItemAsync(storageKey); initialized = true; }
  return { 'Content-Type': 'application/json', ...(native && token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function persist(value: string | null) {
  if (!native) return;
  if (value) await SecureStore.setItemAsync(storageKey, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  else await SecureStore.deleteItemAsync(storageKey);
  token = value;
}
export async function request<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  secureEndpoint();
  return withDeadline(async requestSignal => {
    const response = await fetch(`${apiURL}/api${path}`, { method, headers: await headers(), credentials: native ? 'omit' : 'include', body: body === undefined ? undefined : JSON.stringify(body), signal: requestSignal });
    if (!response.ok) {
      checkUnauthorized(response.status, path);
      const payload = await response.json().catch(() => null);
      throw new APIError(response.status, typeof payload?.detail === 'string' ? payload.detail : `Request failed (${response.status}).`);
    }
    return response.status === 204 ? undefined as T : await response.json();
  }, 30000, signal);
}
export interface Me { id: string; display_name: string; is_guest: boolean }
export interface AuthResult { signed_in: boolean; access_token?: string; recovery_codes?: string[]; two_factor_required?: boolean }
export async function authenticate(kind: 'guest' | 'login' | 'signup', body?: unknown) {
  const result = await request<AuthResult>(`/auth/${native ? 'mobile/' : ''}${kind}`, 'POST', body);
  if (result.access_token) await persist(result.access_token);
  return result;
}
let boot: Promise<Me> | undefined;
export function bootstrap(): Promise<Me> {
  return boot ??= (async () => {
    try { return await request<Me>('/users/me'); }
    catch (error) { if (!(error instanceof APIError) || error.status !== 401) throw error; }
    await persist(null);
    await authenticate('guest');
    return request<Me>('/users/me');
  })().finally(() => { boot = undefined; });
}
export async function logout() { await request('/auth/logout', 'POST'); await persist(null); }
export interface ServerChat { id: string; agent_id: string; title: string; messages?: { id: string; role: string; content: string; pinned_at?: string | null; completion: string; meta?: { notice?: string } }[] }
export function toChat(row: ServerChat): Chat {
  return { id: row.id, agentId: row.agent_id, title: row.title, messages: (row.messages ?? []).filter(m => m.role === 'assistant' || m.role === 'user').map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, saved: !!m.pinned_at, completion: m.completion, notice: m.meta?.notice })) };
}
export async function stream(agentId: string, message: string, conversationId: string | undefined, onEvent: (event: StreamEvent) => void, signal: AbortSignal) {
  secureEndpoint();
  return withDeadline(async requestSignal => {
    const response = await fetch(`${apiURL}/api/agents/${encodeURIComponent(agentId)}/chat/stream`, { method: 'POST', headers: { ...await headers(), Accept: 'text/event-stream' }, credentials: native ? 'omit' : 'include', body: JSON.stringify({ message, conversation_id: conversationId }), signal: requestSignal });
    if (!response.ok) {
      checkUnauthorized(response.status, '/agents/chat');
      const body = await response.json().catch(() => null);
      throw new APIError(response.status, typeof body?.detail === 'string' ? body.detail : 'The reply could not start.');
    }
    if (!response.body) throw new Error('Streaming is unavailable on this connection.');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = new SSEParser();
    let ended = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (requestSignal.aborted) return;
        for (const event of parser.push(done ? decoder.decode() : decoder.decode(value, { stream: true }))) {
          onEvent(event);
          if (event.event === 'error') throw new Error(typeof event.data.error === 'string' ? event.data.error : 'The reply failed.');
          if (event.event === 'end') { ended = true; return; }
        }
        if (done) break;
      }
      if (!ended) throw new Error('The connection ended before the reply finished. Check your chat before sending again.');
    } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
  }, 120000, signal);
}
