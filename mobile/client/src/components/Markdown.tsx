import { Alert, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { markdownBlocks, markdownInline } from '../utils/markdown';
import { colors, fonts } from '../theme';
const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
function Inline({ text }: { text: string }) {
  return <>{markdownInline(text).map((part, index) => <Text key={index} accessibilityRole={part.url ? 'link' : undefined} onPress={part.url ? () => { void Linking.openURL(part.url!).catch(() => Alert.alert('Could not open link', 'Try copying the address into your browser.')); } : undefined} style={{ fontFamily: part.style === 'bold' ? fonts.bold : part.style === 'code' ? mono : undefined, fontStyle: part.style === 'italic' ? 'italic' : 'normal', textDecorationLine: part.url ? 'underline' : 'none', color: part.url ? colors.navy : colors.ink, backgroundColor: part.style === 'code' ? colors.paperInset : undefined }}>{part.text}</Text>)}</>;
}
export function Markdown({ text }: { text: string }) {
  const base = { color: colors.ink, fontFamily: fonts.body, fontSize: 16, lineHeight: 25 };
  return <View style={{ gap: 9 }}>{markdownBlocks(text).map((block, index) => {
    if (block.kind === 'code') return <View key={index} style={{ backgroundColor: colors.paperInset, borderRadius: 8, padding: 12, gap: 6 }}>{!!block.language && <Text style={{ ...base, fontSize: 12 }}>{block.language}</Text>}<ScrollView horizontal><Text selectable style={{ ...base, fontFamily: mono, fontSize: 14, lineHeight: 22 }}>{block.text}</Text></ScrollView></View>;
    if (block.kind === 'table') return <ScrollView horizontal key={index}><View>{block.rows?.map((row, rowIndex) => <View key={rowIndex} style={{ flexDirection: 'row' }}>{row.map((cell, cellIndex) => <Text selectable key={cellIndex} style={{ ...base, width: 170, borderWidth: 1, borderColor: colors.navy, padding: 8, fontFamily: rowIndex ? fonts.body : fonts.bold }}><Inline text={cell} /></Text>)}</View>)}</View></ScrollView>;
    if (block.kind === 'item') return <View key={index} style={{ flexDirection: 'row', gap: 9 }}><Text style={{ ...base, fontFamily: fonts.bold }}>{block.marker}</Text><Text selectable style={{ ...base, flex: 1 }}><Inline text={block.text} /></Text></View>;
    return <Text selectable key={index} style={{ ...base, ...(block.kind === 'heading' ? { fontFamily: fonts.bold, fontSize: block.level === 1 ? 23 : 19, lineHeight: 29 } : {}), ...(block.kind === 'quote' ? { borderLeftWidth: 3, borderColor: colors.gold, paddingLeft: 12 } : {}) }}><Inline text={block.text} /></Text>;
  })}</View>;
}
