import { Tabs } from 'expo-router';
import { LayoutDashboard, Store, ClipboardList, Users } from 'lucide-react-native';
import { colors } from '../../src/theme';
export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.brand, tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.borderSubtle, height: 64, paddingTop: 6, paddingBottom: 10 } }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Overview', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="restaurants" options={{ title: 'Restaurants', tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tabs.Screen name="users" options={{ title: 'Users', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
    </Tabs>
  );
}
