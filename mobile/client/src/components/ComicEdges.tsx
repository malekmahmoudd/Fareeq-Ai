import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
export function ComicEdges() {
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <Svg width="30" height="190" style={{ position: 'absolute', top: 0, right: 0 }}>{Array.from({ length: 32 }, (_, i) => <Circle key={i} cx={6 + (i % 4) * 8} cy={6 + Math.floor(i / 4) * 14} r={2.3} fill={colors.gold} />)}</Svg>
    <Svg width="24" height="150" style={{ position: 'absolute', bottom: 90, left: 0 }} viewBox="0 0 30 160"><Path d="M0 155 Q8 90 3 0" fill="none" stroke={colors.ink} strokeWidth="2" />{[15, 45, 75, 105].map(y => <Path key={y} d={`M3 ${y + 25} Q27 ${y + 12} 22 ${y} Q3 ${y + 4} 3 ${y + 25}`} fill="#365A40" stroke={colors.ink} strokeWidth="1.5" />)}</Svg>
    <Svg width="27" height="100" style={{ position: 'absolute', bottom: 0, right: 0 }}><Rect x="2" y="40" width="9" height="60" fill={colors.navy} /><Rect x="12" y="15" width="12" height="85" fill={colors.navy} />{[30, 42, 54, 66, 78].map(y => <Rect key={y} x="16" y={y} width="3" height="5" fill={colors.gold} />)}</Svg>
  </View>;
}
