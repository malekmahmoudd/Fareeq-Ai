import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Heading, Body, Page, s } from '../components/UI';
import { Action } from '../components/Action';
import { Markdown } from '../components/Markdown';
import { request, live } from '../api/client';

export default function Privacy() {
  const [content, setContent] = useState(''); const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    void request<{ content: string }>('/legal/privacy', 'GET', undefined, controller.signal)
      .then(result => { if (!controller.signal.aborted) { setContent(result.content); setError(''); } })
      .catch(failure => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [revision]);
  return <Page><Heading>Privacy and your data</Heading><Body>Your chats and files are sent to the FareeqAI service. Relevant content is sent to its AI provider to generate replies. Do not upload confidential information. You can delete your workspace from Account.</Body>
    {!live && <Body>This sample preview does not send chats or files to a server. Connect the service to read its full privacy notice.</Body>}
    {!!error && <><Text accessibilityRole="alert" style={s.note}>{error}</Text><Action title="Try again" onPress={() => setRevision(value => value + 1)} /></>}
    {live && !content && !error && <Body>Loading the service privacy notice…</Body>}
    {!!content && <Markdown text={content} />}
    <Action title="Back" onPress={() => router.back()} />
  </Page>;
}
