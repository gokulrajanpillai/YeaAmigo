import { Tabs } from 'expo-router';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Settings } from 'lucide-react-native';
import { colors } from '../../src/theme';
export default function RestaurantLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.brand, tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.borderSubtle, height: 64, paddingTop: 6, paddingBottom: 10 } }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tabs.Screen name="menu" options={{ title: 'Menu', tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
