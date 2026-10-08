import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Page, Heading, Body, s } from '../../components/UI';
import { Action } from '../../components/Action';
import { useResource } from '../../hooks/useResource';
import type { Plan } from '../../features/tracking';
import { colors } from '../../theme';
export default function Plans() {
  const r = useResource<Plan>('/plans');
  return <Page><Heading>Your plans</Heading><Body>Ask a teammate for a step-by-step plan, then tap “Make plan” beneath their reply.</Body><PlansBody key={r.owner} resource={r} /></Page>;
}
function PlansBody({ resource: r }: { resource: ReturnType<typeof useResource<Plan>> }) {
  const [editing, setEditing] = useState(''); const [title, setTitle] = useState('');
  const disabled = r.loading || r.busy || !r.available;
  if (!r.available) return <Body>Connect to your workspace to view plans. Sign-in is optional.</Body>;
  return <><Action title={r.loading ? 'Loading plans…' : 'Refresh plans'} onPress={r.reload} disabled={r.loading || r.busy} />
    {!!r.error && <Text accessibilityRole="alert" style={s.note}>{r.error}</Text>}
    {!r.loading && !r.rows.length && <Body>Your saved checklists will appear here.</Body>}
    {r.rows.map(plan => <View key={plan.id} style={[s.card, { flexDirection: 'column', alignItems: 'stretch' }]}>
      <Text style={s.section}>{plan.title}</Text><Text style={s.note}>{plan.status} · {plan.done}/{plan.steps.length} steps complete</Text>
      {plan.steps.map(step => <Pressable key={step.id} accessibilityRole="checkbox" accessibilityLabel={step.text} accessibilityState={{ checked: step.done, disabled }} disabled={disabled} onPress={() => { void r.mutate(`/plans/${plan.id}/steps/${step.id}`, 'PATCH', { done: !step.done }); }} style={{ flexDirection: 'row', gap: 10, paddingVertical: 12, alignItems: 'flex-start', minHeight: 48 }}><Feather name={step.done ? 'check-square' : 'square'} size={24} color={colors.navy} /><View style={{ flex: 1 }}><Text style={[s.body, { color: colors.ink, textDecorationLine: step.done ? 'line-through' : 'none' }]}>{step.text}</Text>{step.due_on && <Text style={s.note}>Due {step.due_on}</Text>}</View></Pressable>)}
      {editing === plan.id && <><TextInput accessibilityLabel="Plan title" value={title} maxLength={200} onChangeText={setTitle} style={s.field} /><Action title="Save title" disabled={disabled || !title.trim()} onPress={() => { void r.mutate(`/plans/${plan.id}`, 'PATCH', { title: title.trim() }).then(saved => { if (saved) setEditing(''); }); }} /><Action title="Cancel rename" disabled={r.busy} onPress={() => setEditing('')} /></>}
      <Action title="Rename" disabled={disabled} onPress={() => { setEditing(plan.id); setTitle(plan.title); }} />
      <Action title={plan.status === 'done' ? 'Reopen plan' : 'Complete plan'} disabled={disabled} selected={plan.status === 'done'} onPress={() => { void r.mutate(`/plans/${plan.id}`, 'PATCH', { status: plan.status === 'done' ? 'active' : 'done' }); }} />
      <Action title={plan.status === 'archived' ? 'Restore plan' : 'Archive plan'} disabled={disabled} onPress={() => { void r.mutate(`/plans/${plan.id}`, 'PATCH', { status: plan.status === 'archived' ? 'active' : 'archived' }); }} />
      <Action title="Delete" disabled={disabled} onPress={() => Alert.alert('Delete plan?', 'This removes the checklist. The original chat remains.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { void r.mutate(`/plans/${plan.id}`, 'DELETE'); } }])} />
    </View>)}</>;
}
