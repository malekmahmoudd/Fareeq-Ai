import { useEffect, useRef, useState } from 'react';
import { AppState, Modal, Text } from 'react-native';
import { Page, Heading, Body, s } from './UI';
import { Action } from './Action';
import type { Source } from '../features/documents';
import { request } from '../api/client';
import { useWorkspace } from '../state/Workspace';
interface Passage { text: string; filename: string; page?: number; note?: string; heading?: string }
export function Sources({ conversationId, messageId, sources, onClose }: { conversationId: string; messageId: string; sources: Source[]; onClose: () => void }) {
  const { getScope, me } = useWorkspace(); const scope = getScope();
  const [passage, setPassage] = useState<Passage>(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => { if (next !== 'active') { active.current?.abort(); setLoading(false); setError('Reading interrupted. Choose a source again when you return.'); } });
    return () => { subscription.remove(); active.current?.abort(); };
  }, []);
  useEffect(() => () => active.current?.abort(), [scope, me?.id]);
  async function open(source: Source) {
    active.current?.abort(); const current = new AbortController(); active.current = current;
    setLoading(true); setError(''); setPassage(undefined);
    try {
      const result = await request<Passage>(`/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/sources/${encodeURIComponent(source.label)}`, 'GET', undefined, current.signal);
      if (!current.signal.aborted && scope === getScope()) setPassage(result);
    } catch (failure) { if (!current.signal.aborted && scope === getScope()) setError((failure as Error).message); }
    finally { if (active.current === current) { active.current = null; setLoading(false); } }
  }
  return <Modal visible animationType="slide" onRequestClose={onClose}><Page><Heading>Reply sources</Heading><Body>These passages were retrieved for this reply. They are context, not a guarantee that every claim is supported.</Body><Action title="Back to chat" onPress={onClose} />{sources.map(source => <Action key={source.label} title={`${source.label} · ${source.filename}${source.page ? ` · page ${source.page}` : ''}`} onPress={() => { void open(source); }} />)}{loading && <Body>Opening passage…</Body>}{!!error && <Text accessibilityRole="alert" style={s.note}>{error}</Text>}{passage && <><Text style={s.section}>{passage.filename}{passage.page ? ` · page ${passage.page}` : ''}</Text>{!!passage.note && <Body>{passage.note}</Body>}<Text selectable style={s.body}>{passage.text}</Text></>}</Page></Modal>;
}
