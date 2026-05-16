import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input } from '../../src/components/UI';
import { useAuth } from '../../src/auth';
import { colors, space, radius } from '../../src/theme';

const ROLES: { key: string; label: string; sub: string }[] = [
  { key: 'customer', label: 'Customer', sub: 'Order food' },
  { key: 'rider', label: 'Rider', sub: 'Deliver and earn' },
  { key: 'restaurant_owner', label: 'Restaurant', sub: 'List your kitchen' },
];

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [restName, setRestName] = useState('');
  const [restAddr, setRestAddr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < 8) { Alert.alert('Password', 'Min 8 characters'); return; }
    setLoading(true);
    try {
      const u = await signup({
        email: email.trim(), password, full_name: name, role, phone,
        restaurant_name: restName, restaurant_address: restAddr,
      });
      if (u.role === 'customer') router.replace('/(customer)/home');
      else if (u.role === 'rider') router.replace('/(rider)/home');
      else if (u.role === 'restaurant_owner') router.replace('/(restaurant)/dashboard');
    } catch (e: any) { Alert.alert('Sign up failed', e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.xxl }}>
          <TouchableOpacity onPress={() => router.back()} testID="back-btn"><Text style={{ color: colors.textMuted }}>← Back</Text></TouchableOpacity>
          <Text style={styles.h1}>Create your account</Text>
          <Text style={styles.sub}>Pick what brings you to Yeamigo</Text>

          <View style={{ marginVertical: space.lg }}>
            {ROLES.map(r => (
              <TouchableOpacity key={r.key} testID={`role-${r.key}`} onPress={() => setRole(r.key)}
                style={[styles.roleCard, role === r.key && styles.roleActive]}>
                <View>
                  <Text style={[styles.roleLabel, role === r.key && { color: colors.brand }]}>{r.label}</Text>
                  <Text style={styles.roleSub}>{r.sub}</Text>
                </View>
                <View style={[styles.radio, role === r.key && { backgroundColor: colors.brand, borderColor: colors.brand }]} />
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Full name" value={name} onChangeText={setName} testID="signup-name" />
          <View style={{ height: 12 }} />
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" testID="signup-email" />
          <View style={{ height: 12 }} />
          <Input label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="signup-phone" />
          <View style={{ height: 12 }} />
          <Input label="Password (min 8)" value={password} onChangeText={setPassword} secureTextEntry testID="signup-password" />

          {role === 'restaurant_owner' && (
            <>
              <View style={{ height: 12 }} />
              <Input label="Restaurant name" value={restName} onChangeText={setRestName} testID="signup-rest-name" />
              <View style={{ height: 12 }} />
              <Input label="Restaurant address" value={restAddr} onChangeText={setRestAddr} testID="signup-rest-addr" />
              <Text style={{ fontSize: 12, color: colors.amber, marginTop: 8 }}>
                Restaurants require admin approval before going live.
              </Text>
            </>
          )}

          <View style={{ height: space.xl }} />
          <Button title="Create account" onPress={submit} loading={loading} testID="signup-submit" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  roleCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, backgroundColor: '#fff' },
  roleActive: { borderColor: colors.brand, backgroundColor: colors.brandLight },
  roleLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  roleSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.borderSubtle },
});
