import { Tabs } from 'expo-router';
import { Home, ShoppingBag, HelpCircle, User } from 'lucide-react-native';
import { colors } from '../../src/theme';

export default function CustomerLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.borderSubtle, height: 64, paddingTop: 6, paddingBottom: 10 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }} />
      <Tabs.Screen name="support" options={{ title: 'Support', tabBarIcon: ({ color, size }) => <HelpCircle color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
    </Tabs>
  );
}
