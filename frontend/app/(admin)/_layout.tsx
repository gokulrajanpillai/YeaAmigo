import { Tabs } from 'expo-router';
import { LayoutDashboard, Store, ClipboardList, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { useI18n } from '../../src/i18n';
export default function AdminLayout() {
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
      <Tabs.Screen name="dashboard" options={{ title: t('tab_overview'), tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="restaurants" options={{ title: t('tab_restaurants'), tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: t('tab_orders'), tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tabs.Screen name="users" options={{ title: t('tab_users'), tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
    </Tabs>
  );
}
