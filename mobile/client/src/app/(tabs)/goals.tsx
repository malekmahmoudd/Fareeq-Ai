import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { Page, Heading, Body, s } from '../../components/UI';
import { Action } from '../../components/Action';
import { useResource } from '../../hooks/useResource';
import { type Goal, targetDate } from '../../features/tracking';
export default function Goals() {
  const resource = useResource<Goal>('/goals');
  return <Page><Heading>Your goals</Heading><Body>Make room for what matters. Small steps count.</Body><GoalsBody key={resource.owner} resource={resource} /></Page>;
}
function GoalsBody({ resource: r }: { resource: ReturnType<typeof useResource<Goal>> }) {
  const [editing, setEditing] = useState<Goal | null | undefined>();
  const [title, setTitle] = useState(''); const [detail, setDetail] = useState('');
  const [date, setDate] = useState(''); const [priority, setPriority] = useState(3); const [error, setError] = useState('');
  const disabled = r.loading || r.busy || !r.available;
  function edit(goal: Goal | null) { setEditing(goal); setTitle(goal?.title ?? ''); setDetail(goal?.detail ?? ''); setDate(goal?.target_date?.slice(0, 10) ?? ''); setPriority(goal?.priority ?? 3); setError(''); }
  async function submit() {
    if (!title.trim()) { setError('Give your goal a title.'); return; }
    try {
      const body = { title: title.trim(), detail: detail.trim(), priority, target_date: targetDate(date) };
      if (await r.mutate(editing ? `/goals/${editing.id}` : '/goals', editing ? 'PATCH' : 'POST', body)) setEditing(undefined);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Check your goal.'); }
  }
  if (!r.available) return <Body>Connect to your workspace to view goals. Sign-in is optional.</Body>;
  return <><Action title={r.loading ? 'Loading goals…' : 'Refresh goals'} onPress={r.reload} disabled={r.loading || r.busy} />
    {!!r.error && <Text accessibilityRole="alert" style={s.note}>{r.error}</Text>}
    <Action title="New goal" onPress={() => edit(null)} disabled={disabled} selected={editing === null} />
    {editing !== undefined && <View style={[s.card, { flexDirection: 'column', alignItems: 'stretch' }]}>
      <Text style={s.section}>{editing ? 'Edit goal' : 'A brighter next step'}</Text>
      <TextInput accessibilityLabel="Goal title" placeholder="What would you like to achieve?" value={title} onChangeText={setTitle} maxLength={200} style={s.field} />
      <TextInput accessibilityLabel="Goal details" placeholder="Why it matters (optional)" value={detail} onChangeText={setDetail} maxLength={2000} multiline style={s.field} />
      <Text style={s.note}>Priority: 1 is highest, 5 is lowest.</Text><View style={s.grid}>{[1, 2, 3, 4, 5].map(value => <Action key={value} title={String(value)} selected={priority === value} onPress={() => setPriority(value)} />)}</View>
      <TextInput accessibilityLabel="Target date YYYY-MM-DD" placeholder="Target date: YYYY-MM-DD (optional)" value={date} onChangeText={setDate} maxLength={10} style={s.field} />
      {!!error && <Text accessibilityRole="alert" style={s.note}>{error}</Text>}
      <Action title={r.busy ? 'Saving…' : 'Save goal'} disabled={disabled} onPress={() => { void submit(); }} /><Action title="Cancel" disabled={r.busy} onPress={() => setEditing(undefined)} />
    </View>}
    {!r.loading && !r.rows.length && <Body>No goals yet. Start with one thing you want to move forward.</Body>}
    {r.rows.map(goal => <View key={goal.id} style={[s.card, { flexDirection: 'column', alignItems: 'stretch' }]}>
      <Text style={s.section}>{goal.title}</Text>{!!goal.detail && <Body>{goal.detail}</Body>}<Text style={s.note}>{goal.status} · Priority {goal.priority}{goal.target_date ? ` · Target ${goal.target_date.slice(0, 10)}` : ''}</Text>
      <Action title={goal.status === 'done' ? 'Reopen goal' : 'Mark complete'} disabled={disabled} selected={goal.status === 'done'} onPress={() => { void r.mutate(`/goals/${goal.id}`, 'PATCH', { status: goal.status === 'done' ? 'active' : 'done' }); }} />
      <Action title={goal.status === 'paused' ? 'Resume goal' : 'Pause goal'} disabled={disabled} onPress={() => { void r.mutate(`/goals/${goal.id}`, 'PATCH', { status: goal.status === 'paused' ? 'active' : 'paused' }); }} />
      <Action title="Edit" disabled={disabled} onPress={() => edit(goal)} /><Action title="Delete" disabled={disabled} onPress={() => Alert.alert('Delete goal?', 'This removes the goal from your workspace.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { void r.mutate(`/goals/${goal.id}`, 'DELETE'); } }])} />
    </View>)}</>;
}
