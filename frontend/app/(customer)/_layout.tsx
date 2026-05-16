import { Tabs } from 'expo-router';
import { Home, ShoppingBag, HelpCircle, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { useI18n } from '../../src/i18n';

export default function CustomerLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const bottomPad = Math.max(insets.bottom, 8);
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        borderTopColor: colors.borderSubtle,
        backgroundColor: colors.bgWhite,
        height: 60 + bottomPad,
        paddingTop: 8,
        paddingBottom: bottomPad,
      },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
      tabBarItemStyle: { paddingVertical: 4 },
    }}>
      <Tabs.Screen name="home" options={{ title: t('tab_home'), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: t('tab_orders'), tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }} />
      <Tabs.Screen name="support" options={{ title: t('tab_support'), tabBarIcon: ({ color, size }) => <HelpCircle color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tab_profile'), tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
    </Tabs>
  );
}
