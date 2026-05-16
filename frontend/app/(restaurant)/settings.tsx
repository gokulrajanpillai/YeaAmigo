import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth';
import { colors, space } from '../../src/theme';
import { Button, Card } from '../../src/components/UI';

export default function RestSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Settings</Text>
        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textMuted }}>Owner</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 4 }}>{user?.full_name}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 8 }}>Email</Text>
          <Text style={{ fontSize: 14 }}>{user?.email}</Text>
        </Card>
        <Card style={{ marginTop: 14 }}>
          <Text style={{ fontWeight: '600' }}>Operating Hours</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6 }}>Mon–Sun: 11:00 – 23:00</Text>
        </Card>
        <Card style={{ marginTop: 14 }}>
          <Text style={{ fontWeight: '600' }}>Order Settings</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6 }}>Default prep time: 20 min</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Min order: ₹10.00</Text>
        </Card>
        <View style={{ marginTop: 18 }}>
          <Button title="Sign out" variant="secondary" onPress={async () => { await logout(); router.replace('/(auth)/login' as any); }} testID="rest-logout" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
