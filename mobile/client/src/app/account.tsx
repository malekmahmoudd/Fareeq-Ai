import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Heading, Page, s } from '../components/UI';
import { useWorkspace } from '../state/Workspace';
export default function Account() {
  const { live, me, signIn, signOut, error: connectionError } = useWorkspace();
  const [kind, setKind] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [code, setCode] = useState(''); const [secondStep, setSecondStep] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [codes, setCodes] = useState<string[]>([]);
  async function submit() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const result = await signIn(kind, { email: email.trim(), password, ...(secondStep ? { code } : {}), ...(kind === 'signup' ? { display_name: name } : {}) });
      if (result === 'two-factor') { setSecondStep(true); return; }
      setPassword(''); setCode(''); setSecondStep(false); setCodes(result);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not sign in.'); }
    finally { setBusy(false); }
  }
  return <Page><Heading>{me && !me.is_guest ? `Hello, ${me.display_name}` : 'Welcome to FareeqAI'}</Heading><Body>You can use your team without signing in. Create an account to return to your workspace on another device.</Body>
    {!!connectionError && <Text accessibilityRole="alert" style={s.note}>{connectionError}</Text>}
    {!!error && <Text accessibilityRole="alert" style={s.note}>{error}</Text>}
    {codes.length > 0 && <View style={s.card}><View><Body>Keep these recovery codes somewhere safe. They are shown only once.</Body><Text selectable style={s.body}>{codes.join('\n')}</Text><Pressable accessibilityRole="button" style={s.button} onPress={() => setCodes([])}><Text style={s.buttonText}>I saved my codes</Text></Pressable></View></View>}
    {live && (!me || me.is_guest) && <View style={{ gap: 12 }}>
      <Heading>{kind === 'login' ? 'Sign in' : 'Create an account'}</Heading>
      {kind === 'signup' && <TextInput accessibilityLabel="Your name" placeholder="Your name" value={name} onChangeText={setName} style={s.field} editable={!busy} />}
      <TextInput accessibilityLabel="Email" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={s.field} editable={!busy} />
      <TextInput accessibilityLabel="Password" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={kind === 'login' ? 'current-password' : 'new-password'} style={s.field} editable={!busy} />
      {secondStep && <TextInput accessibilityLabel="Authenticator or recovery code" placeholder="Authenticator or recovery code" value={code} onChangeText={setCode} autoCapitalize="none" style={s.field} editable={!busy} />}
      <Pressable accessibilityRole="button" disabled={busy || !email.trim() || !password} style={s.button} onPress={() => { void submit(); }}><Text style={s.buttonText}>{busy ? 'Please wait…' : kind === 'login' ? 'Sign in' : 'Create account'}</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setKind(kind === 'login' ? 'signup' : 'login'); setSecondStep(false); setError(''); }}><Text style={s.role}>{kind === 'login' ? 'Create an account instead' : 'Already have an account? Sign in'}</Text></Pressable>
    </View>}
    {live && me && !me.is_guest && <Pressable accessibilityRole="button" disabled={busy} style={s.button} onPress={async () => { setBusy(true); try { await signOut(); setCodes([]); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not sign out.'); } finally { setBusy(false); } }}><Text style={s.buttonText}>Sign out</Text></Pressable>}
    {!live && <Body>This design preview uses sample data. Connect the local backend to try accounts.</Body>}
    <Pressable accessibilityRole="button" style={s.button} onPress={() => router.back()}><Text style={s.buttonText}>Back to the app</Text></Pressable>
  </Page>;
}
