import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { NotoSansArabic_400Regular } from '@expo-google-fonts/noto-sans-arabic';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkspaceProvider } from '../state/Workspace';
import { colors } from '../theme';
export default function Layout() {
  const [loaded, error] = useFonts({ Inter: Inter_400Regular, InterBold: Inter_700Bold, Archivo: ArchivoBlack_400Regular, Marker: PermanentMarker_400Regular, Arabic: NotoSansArabic_400Regular });
  if (!loaded && !error) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.paper }}><ActivityIndicator color={colors.navy} /></View>;
  return <SafeAreaProvider><WorkspaceProvider><StatusBar style="dark" />{error && <Text>Fonts unavailable; using device fonts.</Text>}<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} /></WorkspaceProvider></SafeAreaProvider>;
}
