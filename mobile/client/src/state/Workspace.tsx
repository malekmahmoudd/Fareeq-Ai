import { createContext, useContext, useEffect, useReducer, useRef, useState, type Dispatch, type PropsWithChildren } from 'react';
import { initialWorkspace, workspaceReducer, type Workspace, type Action, type Chat } from './model';
import { APIError, authenticate, bootstrap, live, logout, observeUnauthorized, request, toChat, type Me, type ServerChat } from '../api/client';
interface Value {
  state: Workspace; dispatch: Dispatch<Action>; live: boolean; me: Me | null; loading: boolean; error: string;
  getScope: () => number;
  refresh: () => Promise<void>; loadChat: (id: string) => Promise<Chat>;
  save: (chatId: string, messageId: string) => Promise<void>;
  signIn: (kind: 'login' | 'signup', body: unknown) => Promise<string[] | 'two-factor'>;
  signOut: () => Promise<void>;
}
const Context = createContext<Value | null>(null);
export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(workspaceReducer, live ? { chats: [], drafts: {} } : initialWorkspace);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState('');
  const generation = useRef(0);
  useEffect(() => observeUnauthorized(() => {
    generation.current++; dispatch({ type: 'clear' }); setMe(null); setLoading(false);
    setError('Your session ended. Reconnect to continue, or sign in to your account.');
  }), []);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  async function loadChat(id: string) {
    const current = generation.current;
    const chat = toChat(await request<ServerChat>(`/conversations/${encodeURIComponent(id)}`));
    if (current === generation.current) dispatch({ type: 'upsert', chat });
    return chat;
  }
  async function refresh() {
    if (!live) return;
    await Promise.resolve();
    const current = generation.current;
    setLoading(true); setError('');
    try {
      const user = await bootstrap();
      const rows = await request<ServerChat[]>('/conversations');
      const pinned = await request<{ message_id: string; conversation_id: string; content: string }[]>('/conversations/pinned');
      const chats = rows.map(toChat).map(chat => ({ ...chat, messages: pinned.filter(m => m.conversation_id === chat.id).map(m => ({ id: m.message_id, role: 'assistant' as const, content: m.content, saved: true })) }));
      if (current === generation.current) { setMe(user); dispatch({ type: 'replace', chats }); }
    } catch (failure) {
      if (current === generation.current) {
        if (failure instanceof APIError && failure.status === 401) { dispatch({ type: 'clear' }); setMe(null); }
        setError(failure instanceof Error ? failure.message : 'Could not connect. Please try again.');
      }
    } finally { if (current === generation.current) setLoading(false); }
  }
  useEffect(() => { const timer = setTimeout(() => { void refresh(); }, 0); return () => { clearTimeout(timer); generation.current++; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(chatId: string, messageId: string) {
    if (!live) { dispatch({ type: 'save', chatId, messageId }); return; }
    const message = stateRef.current.chats.find(chat => chat.id === chatId)?.messages.find(m => m.id === messageId);
    await request(`/conversations/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`, 'PATCH', { pinned: !message?.saved });
    await loadChat(chatId);
  }
  async function signIn(kind: 'login' | 'signup', body: unknown) {
    const result = await authenticate(kind, body);
    if (result.two_factor_required) return 'two-factor';
    generation.current++; dispatch({ type: 'clear' }); setMe(null);
    await refresh();
    return result.recovery_codes ?? [];
  }
  async function signOut() {
    await logout(); generation.current++; dispatch({ type: 'clear' }); setMe(null);
    await refresh();
  }
  return <Context.Provider value={{ state, dispatch, live, me, loading, error, getScope: () => generation.current, refresh, loadChat, save, signIn, signOut }}>{children}</Context.Provider>;
}
export function useWorkspace() { const value = useContext(Context); if (!value) throw new Error('Workspace provider missing'); return value; }
