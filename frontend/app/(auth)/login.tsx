import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Globe, Check } from 'lucide-react-native';
import { Button, Input } from '../../src/components/UI';
import { useAuth } from '../../src/auth';
import { useI18n, LANGS } from '../../src/i18n';
import { colors, space, radius } from '../../src/theme';
import { Penguin } from '../../src/components/Mascot';

const DEMO = [
  { label: 'Customer', email: 'customer@yeaamigo.app' },
  { label: 'Restaurant', email: 'owner1@yeaamigo.app' },
  { label: 'Rider', email: 'rider@yeaamigo.app' },
  { label: 'Admin', email: 'admin@yeaamigo.app' },
];

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, lang, setLang, suggested } = useI18n();
  const [email, setEmail] = useState('customer@yeaamigo.app');
  const [password, setPassword] = useState('YeaAmigo2026!');
  const [loading, setLoading] = useState(false);
  const [showLang, setShowLang] = useState(false);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.xxl, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Penguin size={56} mood="happy" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.brand}>YeaAmigo</Text>
                <Text style={styles.tag}>{t('tagline')}</Text>
              </View>
            </View>
            <TouchableOpacity testID="lang-btn" onPress={() => setShowLang(true)} style={styles.langBtn}>
              <Globe size={16} color={colors.brand} />
              <Text style={styles.langTxt}>{LANGS.find(l => l.code === lang)?.native}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: space.xxxl }} />
          <Text style={styles.h1}>{t('welcome_back')}</Text>
          <Text style={styles.sub}>{t('sign_in_to_continue')}</Text>

          <View style={{ height: space.xl }} />
          <Input label={t('email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" testID="login-email" />
          <View style={{ height: 14 }} />
          <Input label={t('password')} value={password} onChangeText={setPassword} secureTextEntry testID="login-password" />

          <View style={{ height: space.xl }} />
          <Button title={t('sign_in')} onPress={submit} loading={loading} testID="login-submit" />

          <View style={{ height: space.lg }} />
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity testID="go-signup"><Text style={styles.linkRow}>{t('new_to')} <Text style={{ color: colors.brand, fontWeight: '700' }}>{t('create_account')}</Text></Text></TouchableOpacity>
          </Link>

          <View style={{ height: space.xxxl }} />
          <Text style={styles.demoLabel}>{t('demo_accounts')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' }}>
            {DEMO.map(d => (
              <TouchableOpacity key={d.email} testID={`demo-${d.label.toLowerCase()}`}
                onPress={() => setEmail(d.email)}
                style={styles.demoChip}>
                <Text style={styles.demoTxt}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showLang} animationType="slide" transparent onRequestClose={() => setShowLang(false)}>
        <View style={styles.sheetBg}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('choose_language')}</Text>
            {LANGS.map(l => (
              <TouchableOpacity key={l.code} testID={`lang-${l.code}`} onPress={() => { setLang(l.code); setShowLang(false); }} style={styles.langRow}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{l.native}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {l.label}{l.region ? ` · ${l.region}` : ''}
                    {l.code === suggested && lang !== l.code ? '  · ' + t('recommended') : ''}
                  </Text>
                </View>
                {lang === l.code && <Check size={20} color={colors.brand} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: 22, fontWeight: '800', color: colors.brand, letterSpacing: -0.5 },
  tag: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  langBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandLight, paddingHorizontal: 12, height: 36, borderRadius: 999 },
  langTxt: { color: colors.brand, fontWeight: '600', marginLeft: 6, fontSize: 13 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  linkRow: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
  demoLabel: { fontSize: 12, color: colors.textHint, textAlign: 'center' },
  demoChip: { paddingHorizontal: 14, height: 36, borderRadius: 999, backgroundColor: colors.bgWhite, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8 },
  demoTxt: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  langRow: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.borderSubtle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
