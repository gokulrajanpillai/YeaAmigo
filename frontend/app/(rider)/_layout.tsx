/* eslint-disable react/display-name */
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Home, Clock, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { useI18n } from '../../src/i18n';

export default function RiderLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const bottomPad = Math.max(insets.bottom, 8);
  const labelFor = (key: string) => ({ focused, color }: { focused: boolean; color: string }) => (
    <Text style={{ color, fontSize: 11, fontWeight: focused ? '700' : '500', marginTop: 2 }}>{t(key)}</Text>
  );
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.borderSubtle, backgroundColor: colors.bgWhite, height: 64 + bottomPad, paddingTop: 6, paddingBottom: bottomPad + 4 },
      tabBarItemStyle: { paddingVertical: 4 },
    }}>
      <Tabs.Screen name="home" options={{ tabBarLabel: labelFor('tab_home'), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ tabBarLabel: labelFor('tab_history'), tabBarIcon: ({ color, size }) => <Clock color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: labelFor('tab_profile'), tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
