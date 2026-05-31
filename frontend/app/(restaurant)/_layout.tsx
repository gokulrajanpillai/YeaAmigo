/* eslint-disable react/display-name */
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { useI18n } from '../../src/i18n';

export default function RestaurantLayout() {
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
      <Tabs.Screen name="dashboard" options={{ tabBarLabel: labelFor('tab_dashboard'), tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ tabBarLabel: labelFor('tab_orders'), tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tabs.Screen name="menu" options={{ tabBarLabel: labelFor('tab_menu'), tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ tabBarLabel: labelFor('tab_settings'), tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
