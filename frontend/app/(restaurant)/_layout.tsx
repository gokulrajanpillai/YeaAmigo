import { Tabs } from 'expo-router';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { useI18n } from '../../src/i18n';
export default function RestaurantLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const bottomPad = Math.max(insets.bottom, 8);
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.borderSubtle, backgroundColor: colors.bgWhite, height: 60 + bottomPad, paddingTop: 8, paddingBottom: bottomPad },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
      tabBarItemStyle: { paddingVertical: 4 },
    }}>
      <Tabs.Screen name="dashboard" options={{ title: t('tab_dashboard'), tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: t('tab_orders'), tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tabs.Screen name="menu" options={{ title: t('tab_menu'), tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: t('tab_settings'), tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
