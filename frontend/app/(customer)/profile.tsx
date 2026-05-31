import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Globe, Check, ChevronRight, CreditCard, RotateCcw, SlidersHorizontal } from 'lucide-react-native';
import { useAuth } from '../../src/auth';
import { apiGet, saveCart } from '../../src/api';
import { useI18n, LANGS } from '../../src/i18n';
import { colors, radius, space } from '../../src/theme';
import { Button, Card } from '../../src/components/UI';
import { Penguin } from '../../src/components/Mascot';

export default function Profile() {
  const { user, logout } = useAuth();
  const { t, lang, setLang, suggested } = useI18n();
  const router = useRouter();
  const [showLang, setShowLang] = useState(false);
  const [reordering, setReordering] = useState(false);

  const doLogout = () => {
    Alert.alert(t('sign_out') + '?', '', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('sign_out'), style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  const currLang = LANGS.find(l => l.code === lang);

  const reorderLast = async () => {
    setReordering(true);
    try {
      const orders = await apiGet('/orders/mine');
      const last = orders.find((o: any) => ['delivered', 'cancelled'].includes(o.status)) || orders[0];
      if (!last) {
        Alert.alert('No previous orders', 'Place an order first, then it can be reordered from here.');
        return;
      }
      await saveCart({
        restaurant_id: last.restaurant_id,
        restaurant_name: last.restaurant_name,
        items: last.items.map((it: any) => ({
          item_id: it.item_id,
          name: it.name,
          price_gbp: it.price_gbp,
          quantity: it.quantity,
          image_url: it.image_url,
        })),
      });
      router.push('/(customer)/cart' as any);
    } catch (e: any) {
      Alert.alert('Reorder failed', e.message);
    } finally {
      setReordering(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg, paddingBottom: 32 }}>
        <View style={styles.header}>
          <Penguin size={72} mood="happy" />
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={{ color: colors.textMuted }}>{user?.email}</Text>
        </View>

        <Card style={{ marginTop: 18 }}>
          <Row label={t('role')} value={(user?.role || '').replace('_', ' ')} />
          <Row label={t('phone')} value={user?.phone || '—'} />
          <Row label={t('status')} value={user?.approved ? 'Active' : 'Pending'} />
        </Card>

        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <SlidersHorizontal size={18} color={colors.brand} />
            <Text style={{ fontWeight: '700', color: colors.textPrimary, marginLeft: 8 }}>Personal settings</Text>
          </View>
          <Row label="Default address" value="Home" />
          <Row label="Notifications" value="Orders and offers" />
          <Row label="Dietary preference" value="Vegetarian friendly" />
        </Card>

        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <CreditCard size={18} color={colors.brand} />
            <Text style={{ fontWeight: '700', color: colors.textPrimary, marginLeft: 8 }}>Payment options</Text>
          </View>
          <Row label="Primary card" value="Visa ending 4242" />
          <Row label="Backup" value="Apple Pay" />
          <Row label="Receipts" value="Email" />
        </Card>

        <TouchableOpacity testID="reorder-last" onPress={reorderLast} disabled={reordering} style={styles.actionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RotateCcw size={20} color={colors.brand} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Resend last order</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>Reload the latest past order into your cart</Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity testID="open-lang" onPress={() => setShowLang(true)} style={styles.langCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Globe size={20} color={colors.brand} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontWeight: '600', color: colors.textPrimary }}>{t('language')}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{currLang?.native} · {currLang?.label}</Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={{ marginTop: 18 }}>
          <Button title={t('sign_out')} variant="danger" onPress={doLogout} testID="logout-btn" />
        </View>
      </ScrollView>

      <Modal visible={showLang} animationType="slide" transparent onRequestClose={() => setShowLang(false)}>
        <View style={styles.sheetBg}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('choose_language')}</Text>
            {LANGS.map(l => (
              <TouchableOpacity key={l.code} testID={`p-lang-${l.code}`} onPress={() => { setLang(l.code); setShowLang(false); }} style={styles.langRow}>
                <View style={{ flex: 1 }}>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontWeight: '600', textTransform: 'capitalize' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 24 },
  name: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  langCard: { marginTop: 14, backgroundColor: colors.bgWhite, borderRadius: radius.lg, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 0.5, borderColor: colors.borderSubtle },
  actionCard: { marginTop: 14, backgroundColor: colors.bgWhite, borderRadius: radius.lg, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 0.5, borderColor: colors.borderSubtle },
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  langRow: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.borderSubtle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
