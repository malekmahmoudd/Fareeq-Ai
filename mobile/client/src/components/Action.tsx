import { Pressable, Text } from 'react-native';
import { colors } from '../theme';
import { s } from './UI';
export function Action({ title, onPress, disabled = false, selected = false }: { title: string; onPress: () => void; disabled?: boolean; selected?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled} onPress={onPress} style={[s.button, { opacity: disabled ? 0.45 : 1, backgroundColor: selected ? colors.navy : colors.reading }]}><Text style={[s.buttonText, selected && { color: colors.reading }]}>{title}</Text></Pressable>;
}
