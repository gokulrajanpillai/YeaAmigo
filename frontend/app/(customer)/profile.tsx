import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth';
import { colors, radius, space } from '../../src/theme';
import { Button, Card } from '../../src/components/UI';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const out = () => Alert.alert('Sign out?', '', [{ text: 'Cancel' }, { text: 'Sign out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login' as any); }}]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg }}>
        <Text style={styles.h1}>Profile</Text>

        <View style={styles.avatarBox}>
          <View style={styles.avatar}><Text style={{ fontSize: 32, fontWeight: '700', color: '#fff' }}>{user?.full_name?.[0] || '?'}</Text></View>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={{ color: colors.textMuted }}>{user?.email}</Text>
        </View>

        <Card style={{ marginTop: 18 }}>
          <Row label="Role" value={(user?.role || '').replace('_', ' ')} />
          <Row label="Phone" value={user?.phone || '—'} />
          <Row label="Status" value={user?.approved ? 'Active' : 'Pending'} />
        </Card>

        <View style={{ marginTop: 18 }}>
          <Button title="Sign out" variant="secondary" onPress={out} testID="logout-btn" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontWeight: '600', textTransform: 'capitalize' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700' },
  avatarBox: { alignItems: 'center', marginTop: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '700', marginTop: 10 },
});
