import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/auth';
import { useI18n } from '../src/i18n';
import { colors } from '../src/theme';
import { Penguin } from '../src/components/Mascot';

export default function Splash() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

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
      <Penguin size={140} mood="happy" />
      <Text style={styles.brand}>YeaAmigo</Text>
      <Text style={styles.tag}>{t('tagline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSurface, padding: 24 },
  brand: { fontSize: 42, fontWeight: '800', color: colors.brand, letterSpacing: -1, marginTop: 12 },
  tag: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
});
