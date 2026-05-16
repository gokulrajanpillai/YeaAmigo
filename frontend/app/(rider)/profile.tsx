import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth';
import { Button, Card } from '../../src/components/UI';
import { colors, space } from '../../src/theme';

export default function RiderProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Profile</Text>
        <View style={styles.avatarBox}>
          <View style={styles.avatar}><Text style={{ fontSize: 32, fontWeight: '700', color: '#fff' }}>{user?.full_name?.[0]}</Text></View>
          <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 10 }}>{user?.full_name}</Text>
          <Text style={{ color: colors.textMuted }}>{user?.email}</Text>
          <Text style={{ color: colors.success, marginTop: 6, fontWeight: '600' }}>✓ Verified rider</Text>
        </View>
        <Card style={{ marginTop: 18 }}>
          <Text style={{ color: colors.textMuted }}>Vehicle</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 4 }}>E-Bike</Text>
        </Card>
        <View style={{ marginTop: 18 }}>
          <Button title="Sign out" variant="secondary" onPress={async () => { await logout(); router.replace('/(auth)/login' as any); }} testID="rider-logout" />
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  avatarBox: { alignItems: 'center', marginTop: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
});
