import { Tabs } from 'expo-router';
import { Home, Clock, User } from 'lucide-react-native';
import { colors } from '../../src/theme';
export default function RiderLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.brand, tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.borderSubtle, height: 64, paddingTop: 6, paddingBottom: 10 } }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <Clock color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
