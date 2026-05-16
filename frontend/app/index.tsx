import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/auth';
import { colors } from '../src/theme';

export default function Splash() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/(auth)/login');
    else if (user.role === 'customer') router.replace('/(customer)/home');
    else if (user.role === 'restaurant_owner') router.replace('/(restaurant)/dashboard');
    else if (user.role === 'rider') router.replace('/(rider)/home');
    else if (user.role === 'admin') router.replace('/(admin)/dashboard');
  }, [user, loading, router]);

  return (
    <View style={styles.c} testID="splash-screen">
      <Text style={styles.brand}>Yeamigo</Text>
      <Text style={styles.tag}>Good food, great amigos.</Text>
      <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  brand: { fontSize: 40, fontWeight: '800', color: colors.brand, letterSpacing: -1 },
  tag: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
});
