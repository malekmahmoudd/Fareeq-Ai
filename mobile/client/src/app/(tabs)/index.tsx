import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { agents } from '../../data/agents';
import { AgentCard, Page, Portrait, s } from '../../components/UI';
import { colors, fonts } from '../../theme';
import { useWorkspace } from '../../state/Workspace';
export default function Home() {
  const { state, dispatch, live, loading, error, refresh } = useWorkspace();
  const leo = agents[0];
  return <Page><View style={{ width: '100%', aspectRatio: 1.84, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.ink, borderRadius: 14, overflow: 'hidden' }}><Image source={require('../../../assets/portraits/leo-home-hero.png')} accessibilityLabel="Leo, your personal AI assistant" resizeMode="cover" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }} /><View style={{ position: 'absolute', right: 0, top: 0, width: '44%', height: '100%', paddingHorizontal: 10, justifyContent: 'center', gap: 8 }}><Text style={{ fontFamily: fonts.heading, color: colors.ink, fontSize: 22 }}>Meet Leo</Text><Text style={[s.body, { color: colors.navy, fontSize: 13, lineHeight: 20 }]}>{leo.tagline}</Text></View></View>
    <View style={[s.field, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}><TextInput accessibilityLabel="Message Leo" placeholder="Message Leo…" placeholderTextColor={colors.secondaryText} value={state.drafts.modeer ?? ''} onChangeText={text => dispatch({ type: 'draft', agentId: 'modeer', text })} style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.ink }} /><Pressable accessibilityRole="button" accessibilityLabel="Open Leo chat" onPress={() => router.push('/agents/modeer')} style={{ backgroundColor: colors.pink, padding: 12, borderRadius: 24 }}><Feather name="arrow-right" size={20} color={colors.reading} /></Pressable></View>
    <View style={s.row}><Text style={s.section}>Recent chats</Text><Pressable accessibilityRole="button" onPress={() => router.push('/history')}><Text style={s.role}>See all →</Text></Pressable></View>{state.chats.slice(0, 3).map(chat => { const agent = agents.find(item => item.id === chat.agentId)!; return <Pressable key={chat.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/agents/[id]', params: { id: agent.id, conversation: chat.id } })} style={s.card}><Portrait agent={agent} size={48} /><View style={{ flex: 1 }}><Text style={s.section}>{chat.title}</Text><Text style={s.role}>with {agent.name}</Text></View><Feather name="chevron-right" size={18} /></Pressable>; })}
    {!!error && <View><Text accessibilityRole="alert" style={s.note}>{error}</Text><Pressable accessibilityRole="button" style={s.button} onPress={() => { void refresh(); }}><Text style={s.buttonText}>Try connecting again</Text></Pressable></View>}
    <Text style={s.section}>Your team</Text><View style={s.grid}>{[agents[1], agents[2]].map(agent => <View key={agent.id} style={s.tile}><AgentCard agent={agent} compact /></View>)}</View><Text style={s.note}>{live ? (loading ? 'Opening your workspace…' : 'Try your team freely. Sign in whenever you like.') : 'Design preview · Sample workspace, no live AI calls.'}</Text>
  </Page>;
}
