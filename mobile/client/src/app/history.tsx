import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { Heading, Page, s } from '../components/UI';
import { useWorkspace } from '../state/Workspace';
import { agents } from '../data/agents';
export default function History() { const { state } = useWorkspace(); return <Page><Heading>Your chats</Heading>{state.chats.map(chat => <Pressable key={chat.id} accessibilityRole="button" style={s.card} onPress={() => router.push({ pathname: '/agents/[id]', params: { id: chat.agentId, conversation: chat.id } })}><Text style={s.section}>{chat.title}</Text><Text style={s.role}>{agents.find(agent => agent.id === chat.agentId)?.name}</Text></Pressable>)}<Pressable accessibilityRole="button" style={s.button} onPress={() => router.back()}><Text style={s.buttonText}>Back</Text></Pressable></Page>; }
