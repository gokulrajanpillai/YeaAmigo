import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Button, Input } from '../../src/components/UI';
import { useAuth } from '../../src/auth';
import { colors, space } from '../../src/theme';

const DEMO = [
  { label: 'Customer', email: 'customer@yeamigo.app' },
  { label: 'Restaurant', email: 'owner1@yeamigo.app' },
  { label: 'Rider', email: 'rider@yeamigo.app' },
  { label: 'Admin', email: 'admin@yeamigo.app' },
];

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('customer@yeamigo.app');
  const [password, setPassword] = useState('Yeamigo2026!');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      if (u.role === 'customer') router.replace('/(customer)/home');
      else if (u.role === 'restaurant_owner') router.replace('/(restaurant)/dashboard');
      else if (u.role === 'rider') router.replace('/(rider)/home');
      else if (u.role === 'admin') router.replace('/(admin)/dashboard');
    } catch (e: any) { Alert.alert('Login failed', e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.xxl, flexGrow: 1 }}>
          <Text style={styles.brand}>Yeamigo</Text>
          <Text style={styles.tag}>Good food, great amigos.</Text>

          <View style={{ height: space.huge }} />

          <Text style={styles.h1}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to continue</Text>

          <View style={{ height: space.xl }} />

          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" testID="login-email" />
          <View style={{ height: 14 }} />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry testID="login-password" />

          <View style={{ height: space.xl }} />
          <Button title="Sign in" onPress={submit} loading={loading} testID="login-submit" />

          <View style={{ height: space.lg }} />
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity testID="go-signup"><Text style={styles.linkRow}>New to Yeamigo? <Text style={{ color: colors.brand, fontWeight: '600' }}>Create account</Text></Text></TouchableOpacity>
          </Link>

          <View style={{ height: space.xxxl }} />
          <Text style={styles.demoLabel}>Demo accounts (password: Yeamigo2026!)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {DEMO.map(d => (
              <TouchableOpacity key={d.email} testID={`demo-${d.label.toLowerCase()}`}
                onPress={() => { setEmail(d.email); }}
                style={styles.demoChip}>
                <Text style={styles.demoTxt}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: 32, fontWeight: '800', color: colors.brand, letterSpacing: -1 },
  tag: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  h1: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  linkRow: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
  demoLabel: { fontSize: 12, color: colors.textHint, textAlign: 'center' },
  demoChip: { paddingHorizontal: 12, height: 36, borderRadius: 999, backgroundColor: colors.bgSurface, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8 },
  demoTxt: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
});
