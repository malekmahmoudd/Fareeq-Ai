import { useEffect, useRef, useState } from 'react';
import { AppState, Modal, Text } from 'react-native';
import { Heading, Body, Page, s } from './UI';
import { Action } from './Action';
import { request } from '../api/client';
import { useWorkspace } from '../state/Workspace';

const reasons = [ ['unsafe', 'Dangerous or unsafe'], ['hateful', 'Hate or harassment'], ['sexual', 'Inappropriate sexual content'], ['misleading', 'Misleading or deceptive'], ['other', 'Other inappropriate content'] ] as const;
export function ReportReply({ conversationId, messageId, onClose }: { conversationId: string; messageId: string; onClose: () => void }) {
  const { getScope } = useWorkspace(); const scope = getScope();
  const [reason, setReason] = useState<string>('unsafe'); const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false); const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => { if (next !== 'active') active.current?.abort(); });
    return () => { subscription.remove(); active.current?.abort(); };
  }, []);
  async function submit() {
    if (active.current || getScope() !== scope) return;
    const controller = new AbortController(); active.current = controller;
    setBusy(true); setError('');
    try {
      await request(`/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/report`, 'POST', { reason }, controller.signal);
      if (!controller.signal.aborted && getScope() === scope) setSent(true);
    } catch (failure) { if (getScope() === scope) setError(controller.signal.aborted ? 'Reporting was interrupted. You can submit again; duplicate reports are not created.' : failure instanceof Error ? failure.message : 'Could not send report.'); }
    finally { if (active.current === controller) { active.current = null; setBusy(false); } }
  }
  return <Modal visible animationType="slide" onRequestClose={onClose}><Page><Heading>Report AI reply</Heading>{sent ? <Body>Report received. Thank you for helping improve FareeqAI.</Body> : <><Body>Flag this reply for the service operator to review. The category is stored with the reply; no additional copy of your conversation is sent.</Body>{reasons.map(([value, label]) => <Action key={value} title={label} selected={reason === value} disabled={busy} onPress={() => setReason(value)} />)}{!!error && <Text accessibilityRole="alert" style={s.note}>{error}</Text>}<Action title={busy ? 'Sending…' : 'Send report'} disabled={busy} onPress={() => { void submit(); }} /></>}<Action title="Back to chat" onPress={onClose} /></Page></Modal>;
}
