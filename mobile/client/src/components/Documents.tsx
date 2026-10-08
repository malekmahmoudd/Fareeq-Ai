import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Modal, Platform, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { Page, Heading, Body, s } from './UI';
import { Action } from './Action';
import { useResource } from '../hooks/useResource';
import { useWorkspace } from '../state/Workspace';
import { uploadDocument } from '../api/client';
import { type Document, toggleAttachment, validateDocument, UploadTask } from '../features/documents';
export function Documents({ agentId, selected, onSelect, onClose }: { agentId: string; selected: string[]; onSelect: (ids: string[]) => void; onClose: () => void }) {
  const r = useResource<Document>('/documents'); const { getScope, me } = useWorkspace();
  const [uploading, setUploading] = useState(false); const [error, setError] = useState('');
  const upload = useRef<UploadTask | null>(null);
  const [openedAt] = useState(Date.now);
  const pollingStarted = useRef(openedAt);
  const scope = getScope();
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => { if (next !== 'active') upload.current?.background(); });
    return () => { subscription.remove(); upload.current?.abort(); };
  }, []);
  useEffect(() => () => upload.current?.abort(), [scope, me?.id]);
  useEffect(() => {
    if (!r.available || uploading || r.loading || r.busy || !r.rows.some(doc => doc.status === 'processing') || Date.now() - pollingStarted.current > 120000) return;
    const timer = setTimeout(r.reload, 3000); return () => clearTimeout(timer);
  }, [r.available, r.rows, r.loading, r.busy, r.reload, uploading]);
  async function pick() {
    if (upload.current || !r.available) return;
    const current = new UploadTask(); upload.current = current; setUploading(true); setError('');
    let cached: File | undefined;
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false, type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/*', 'image/png', 'image/jpeg', 'image/webp'] });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (Platform.OS !== 'web') cached = new File(asset.uri);
      if (current.signal.aborted || getScope() !== scope) return;
      const size = asset.size ?? asset.file?.size ?? cached?.size ?? 0;
      validateDocument(asset.name, size);
      const form = new FormData();
      const file = asset.file ?? cached;
      if (!file) throw new Error('This file could not be opened. Please choose it again.');
      form.append('file', file, asset.name); form.append('agent_id', agentId); form.append('shared', 'false');
      if (!current.startUpload()) return;
      await uploadDocument(form, current.signal);
      if (getScope() === scope && !current.signal.aborted) { pollingStarted.current = Date.now(); r.reload(); }
    } catch (failure) {
      if (getScope() === scope) { setError(current.signal.aborted ? 'Upload interrupted. Refresh files to check whether it arrived before uploading it again.' : `${failure instanceof Error ? failure.message : 'Upload failed.'} Refresh files before retrying.`); r.reload(); }
    } finally {
      // Only remove the picker's cache copy, never the user's original file.
      if (cached && cached.uri.startsWith(`${Paths.cache.uri.replace(/\/$/, '')}/`)) { try { if (cached.exists) cached.delete(); } catch { /* OS can clear cached files. */ } }
      if (upload.current === current) upload.current = null;
      setUploading(false);
    }
  }
  const disabled = uploading || r.loading || r.busy || !r.available;
  const docs = r.rows.filter(doc => doc.agent_id === agentId || doc.shared);
  return <Modal visible animationType="slide" onRequestClose={onClose}><Page><Heading>Your files</Heading><Body>Upload a file for this teammate. Only extracted text is saved. Share with the team if you want other teammates to use it.</Body><Text style={s.note}>PDF, DOCX, TXT, Markdown, PNG, JPEG, WebP · up to 10 MB · up to five attachments per message</Text>
    <Action title="Back to chat" onPress={onClose} /><Action title={uploading ? 'Choosing or uploading…' : 'Upload a file'} disabled={disabled} onPress={() => { void pick(); }} />
    {uploading && <Action title="Cancel upload" onPress={() => upload.current?.abort()} />}
    <Action title={r.loading ? 'Loading files…' : 'Refresh files'} disabled={disabled} onPress={() => { pollingStarted.current = Date.now(); r.reload(); }} />
    {!!(error || r.error) && <Text accessibilityRole="alert" style={s.note}>{error || r.error}</Text>}
    {!r.loading && !docs.length && <Body>No files for this teammate yet.</Body>}
    {docs.map(doc => <View key={doc.id} style={[s.card, { flexDirection: 'column', alignItems: 'stretch' }]}><Text style={s.section}>{doc.filename}</Text><Text style={s.note}>{doc.status} · {Math.ceil(doc.size_bytes / 1024)} KB · {doc.shared ? 'Shared with your team' : 'Private to this teammate'}</Text>{doc.status === 'processing' && <Body>Reading your file. You can close this screen and check later.</Body>}{!!doc.error && <Text style={s.note}>{doc.error}</Text>}
      <Action title={selected.includes(doc.id) ? 'Remove from next message' : 'Attach to next message'} selected={selected.includes(doc.id)} disabled={disabled || doc.status !== 'ready'} onPress={() => { try { onSelect(toggleAttachment(selected, doc)); } catch (failure) { setError((failure as Error).message); } }} />
      <Action title={doc.shared ? 'Make private to its teammate' : 'Share with your team'} disabled={disabled} onPress={() => { void r.mutate(`/documents/${doc.id}`, 'PATCH', { shared: !doc.shared }); }} />
      <Action title="Delete file" disabled={disabled} onPress={() => Alert.alert('Delete file?', 'Its extracted text will be removed from your workspace.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { void r.mutate(`/documents/${doc.id}`, 'DELETE').then(saved => { if (saved) onSelect(selected.filter(id => id !== doc.id)); }); } }])} />
    </View>)}</Page></Modal>;
}
