import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useIsFocused, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { agents } from '../../data/agents';
import { Body, Portrait, s } from '../../components/UI';
import { ComicEdges } from '../../components/ComicEdges';
import { useWorkspace } from '../../state/Workspace';
import { stream } from '../../api/client';
import type { Chat } from '../../state/model';
import { colors, fonts } from '../../theme';
export default function ChatScreen() {
  const params = useLocalSearchParams<{ id: string; conversation?: string }>();
  const agent = agents.find(item => item.id === params.id);
  const { state, dispatch, live, me, loading, loadChat, save, getScope } = useWorkspace();
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState('');
  const [chatLoading, setChatLoading] = useState(!!params.conversation && live);
  const active = useRef<AbortController | null>(null);
  const backgroundInterrupted = useRef(false);
  const [resumeVersion, setResumeVersion] = useState(0);
  const focused = useIsFocused();
  useFocusEffect(useCallback(() => () => active.current?.abort(), []));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next !== 'active' && active.current) {
        backgroundInterrupted.current = true;
        active.current.abort();
        setProblem('The reply was interrupted while the app was in the background. Reopening your saved conversation; your message will not be sent again.');
      }
      if (next === 'active') setResumeVersion(value => value + 1);
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!focused || !live || !params.conversation || active.current || !me || (AppState.currentState && AppState.currentState !== 'active')) return;
    let mounted = true;
    setChatLoading(true);
    void loadChat(params.conversation).catch(error => { if (mounted) setProblem(error.message); }).finally(() => { if (mounted) setChatLoading(false); });
    return () => { mounted = false; };
  }, [params.conversation, live, me?.id, focused, resumeVersion]); // eslint-disable-line react-hooks/exhaustive-deps
  const [newId] = useState(() => `preview-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const turnCounter = useRef(0);
  const scroll = useRef<ScrollView>(null);
  const chatId = params.conversation ?? newId;
  const chat = state.chats.find(item => item.id === chatId && item.agentId === params.id);
  const text = state.drafts[params.id] ?? '';
  if (!agent) return <SafeAreaView style={s.page}><Body>That teammate is not available.</Body><Pressable onPress={() => router.replace('/team')} accessibilityRole="button" style={s.button}><Text style={s.buttonText}>Back to your team</Text></Pressable></SafeAreaView>;
  if (params.conversation && !chat && !chatLoading && !pending && !loading) return <SafeAreaView style={s.page}><Body>{problem || 'This conversation is no longer available.'}</Body><Pressable onPress={() => router.replace('/history')} accessibilityRole="button" style={s.button}><Text style={s.buttonText}>Your chats</Text></Pressable></SafeAreaView>;
  async function send() {
    if (!text.trim() || !agent || active.current) return;
    if (!live) {
      dispatch({ type: 'send', chatId, agentId: agent.id, text, turnId: `${newId}-${++turnCounter.current}` });
      if (!params.conversation) router.setParams({ conversation: chatId });
      return;
    }
    if (!me || loading || chatLoading) return;
    const controller = new AbortController(); active.current = controller; backgroundInterrupted.current = false;
    setPending(true); setProblem('');
    const scope = getScope();
    let serverId = params.conversation;
    let answer = '';
    const local: Chat = { id: chatId, agentId: agent.id, title: chat?.title ?? text.slice(0, 60), messages: [...(chat?.messages ?? []), { id: 'sending-user', role: 'user', content: text.trim() }] };
    try {
      await stream(agent.id, text.trim(), serverId, event => {
        if (controller.signal.aborted || scope !== getScope()) return;
        if (event.event === 'start' && typeof event.data.conversation_id === 'string') {
          serverId = event.data.conversation_id; local.id = serverId;
          dispatch({ type: 'draft', agentId: agent.id, text: '' });
          dispatch({ type: 'upsert', chat: { ...local } });
          router.setParams({ conversation: serverId });
        }
        if (event.event === 'delta' && typeof event.data.text === 'string') {
          answer += event.data.text;
          dispatch({ type: 'upsert', chat: { ...local, messages: [...local.messages, { id: 'streaming-assistant', role: 'assistant', content: answer, completion: 'streaming' }] } });
        }
        if (event.event === 'end' && event.data.notice) setProblem(String(event.data.notice));
      }, controller.signal);
    } catch (error) {
      if (!controller.signal.aborted) setProblem(error instanceof Error ? error.message : 'The reply was interrupted.');
    } finally {
      if (serverId && !controller.signal.aborted && scope === getScope()) {
        try { await loadChat(serverId); } catch { setProblem('Could not reload the saved reply. Open this chat again before resending.'); }
      }
      active.current = null; setPending(false); setChatLoading(false);
      if (backgroundInterrupted.current && AppState.currentState === 'active') setResumeVersion(value => value + 1);
    }
  }
  return <SafeAreaView style={s.page} edges={['top', 'bottom']}><ComicEdges />
    <View style={{ padding: 14, paddingHorizontal: 24, borderBottomWidth: 1, borderColor: '#D4CEBD', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to your team" onPress={() => router.canGoBack() ? router.back() : router.replace('/team')} style={{ padding: 8 }}><Feather name="chevron-left" color={colors.ink} size={26} /></Pressable><Portrait agent={agent} size={50} /><View style={{ flex: 1 }}><Text style={{ fontFamily: fonts.heading, color: colors.ink, fontSize: 22 }}>{agent.name}</Text><Text style={s.role}>{agent.role} teammate</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Conversation history" onPress={() => router.push('/history')} style={{ padding: 8 }}><Feather name="clock" size={23} color={colors.ink} /></Pressable>
    </View>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })} contentContainerStyle={{ padding: 24, gap: 18, width: '100%', maxWidth: 720, alignSelf: 'center' }}>
        <Text style={s.note}>{live ? (pending ? 'Your teammate is replying…' : loading || chatLoading ? 'Opening your workspace…' : 'Your conversation is saved in your workspace.') : 'Design preview · Sample replies, no live AI calls.'}</Text>
        {!!problem && <Text accessibilityRole="alert" style={s.note}>{problem}</Text>}
        {!chat?.messages.length && <View style={s.card}><Body>{agent.tagline} What would you like to work on?</Body></View>}
        {chat?.messages.map(message => <View key={message.id} style={{ gap: 8 }}>
          {message.role === 'assistant' && <Portrait agent={agent} size={38} />}
          <View style={{ backgroundColor: message.role === 'user' ? colors.pinkSoft : colors.reading, borderColor: colors.ink, borderWidth: 2, borderRadius: 14, padding: 16, maxWidth: message.role === 'user' ? '88%' : '100%', alignSelf: message.role === 'user' ? 'flex-end' : 'stretch' }}><Text selectable style={{ color: colors.ink, fontFamily: fonts.body, fontSize: 16, lineHeight: 25 }}>{message.content}</Text></View>
          {!!message.notice && <Text style={s.note}>{message.notice}</Text>}
          {message.role === 'assistant' && <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Pressable accessibilityRole="button" accessibilityLabel={message.saved ? 'Unsave reply' : 'Save reply'} accessibilityState={{ selected: !!message.saved }} disabled={pending || chatLoading} onPress={() => { void save(chatId, message.id).catch(error => setProblem(error.message)); }} style={{ padding: 12, flexDirection: 'row', gap: 6 }}><Feather name={message.saved ? 'check' : 'bookmark'} size={19} color={colors.navy} /><Text style={s.role}>{message.saved ? 'Saved' : 'Save'}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Copy reply" onPress={async () => { try { await Clipboard.setStringAsync(message.content); Alert.alert('Copied', 'Reply copied to your clipboard.'); } catch { Alert.alert('Copy unavailable', 'Select the reply text to copy it.'); } }} style={{ padding: 12, flexDirection: 'row', gap: 6 }}><Feather name="copy" size={19} color={colors.navy} /><Text style={s.role}>Copy</Text></Pressable>
          </View>}
        </View>)}
        {params.conversation === 'sample-interview' && <Pressable accessibilityRole="button" style={[s.button, { backgroundColor: colors.reading }]} onPress={() => dispatch({ type: 'draft', agentId: agent.id, text: 'Help me practise my introduction.' })}><Text style={s.buttonText}>✦ Practise my introduction</Text></Pressable>}
      </ScrollView>
      <View style={{ marginHorizontal: 20, marginBottom: 8, padding: 8, backgroundColor: colors.reading, borderWidth: 2, borderColor: colors.ink, borderRadius: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Attach a file" onPress={() => Alert.alert('Files are coming next', 'File uploads will be added in a later mobile step.')} style={{ width: 44, height: 44, borderWidth: 2, borderColor: colors.ink, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}><Feather name="plus" size={22} color={colors.ink} /></Pressable>
        <TextInput multiline accessibilityLabel={`Message ${agent.name}`} placeholder={`Ask ${agent.name}…`} placeholderTextColor={colors.secondaryText} value={text} onChangeText={value => dispatch({ type: 'draft', agentId: agent.id, text: value })} style={{ flex: 1, minHeight: 44, maxHeight: 140, paddingTop: 11, paddingBottom: 9, color: colors.ink, fontFamily: fonts.body, fontSize: 16 }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!text.trim() || pending || (live && (!me || loading || chatLoading))} accessibilityState={{ disabled: !text.trim() || pending || (live && (!me || loading || chatLoading)) }} onPress={() => { void send(); }} style={{ backgroundColor: colors.gold, opacity: text.trim() ? 1 : 0.45, width: 44, height: 44, borderWidth: 2, borderColor: colors.ink, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}><Feather name="send" size={21} color={colors.ink} /></Pressable>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
