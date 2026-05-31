import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../src/auth';
import { apiGet, apiPatch } from '../../src/api';
import { colors, space } from '../../src/theme';
import { Button, Card } from '../../src/components/UI';

export default function RestSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setRestaurant(await apiGet('/restaurants/owner/mine')); } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const setField = (key: string, value: any) => setRestaurant((r: any) => ({ ...(r || {}), [key]: value }));
  const setPayment = (key: string, value: any) => setRestaurant((r: any) => ({ ...(r || {}), payments: { ...(r?.payments || {}), [key]: value } }));

  const save = async () => {
    if (!restaurant?.id) return;
    setSaving(true);
    try {
      const updated = await apiPatch(`/restaurants/${restaurant.id}`, {
        name: restaurant.name,
        description: restaurant.description,
        cuisine_tags: String(restaurant.cuisine_tags_text || restaurant.cuisine_tags?.join(', ') || '')
          .split(',')
          .map((x: string) => x.trim())
          .filter(Boolean),
        address: restaurant.address,
        avg_prep_mins: Number(restaurant.avg_prep_mins || 20),
        min_order_gbp: Number(restaurant.min_order_gbp || 0),
        payments: {
          ...(restaurant.payments || {}),
          card_fee_pct: Number(restaurant.payments?.card_fee_pct || 0),
        },
      });
      setRestaurant(updated);
      Alert.alert('Settings saved', 'Restaurant account and payment settings were updated.');
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={{ fontWeight: '700', marginBottom: 12 }}>Restaurant account</Text>
          <Field label="Restaurant name" value={restaurant?.name || ''} onChangeText={(v: string) => setField('name', v)} testID="settings-name" />
          <Field label="Description" value={restaurant?.description || ''} onChangeText={(v: string) => setField('description', v)} testID="settings-description" multiline />
          <Field label="Cuisine tags" value={restaurant?.cuisine_tags_text ?? restaurant?.cuisine_tags?.join(', ') ?? ''} onChangeText={(v: string) => setField('cuisine_tags_text', v)} testID="settings-cuisines" />
          <Field label="Address" value={restaurant?.address || ''} onChangeText={(v: string) => setField('address', v)} testID="settings-address" />
        </Card>
        <Card style={{ marginTop: 14 }}>
          <Text style={{ fontWeight: '600' }}>Order Settings</Text>
          <Field label="Default prep time (mins)" value={String(restaurant?.avg_prep_mins || '')} onChangeText={(v: string) => setField('avg_prep_mins', v)} keyboardType="number-pad" testID="settings-prep" />
          <Field label="Minimum order" value={String(restaurant?.min_order_gbp || '')} onChangeText={(v: string) => setField('min_order_gbp', v)} keyboardType="decimal-pad" testID="settings-min-order" />
        </Card>
        <Card style={{ marginTop: 14 }}>
          <Text style={{ fontWeight: '700', marginBottom: 12 }}>Payments</Text>
          <Field label="Payout account" value={restaurant?.payments?.payout_account || ''} onChangeText={(v: string) => setPayment('payout_account', v)} testID="settings-payout" />
          <Field label="Settlement schedule" value={restaurant?.payments?.settlement || ''} onChangeText={(v: string) => setPayment('settlement', v)} testID="settings-settlement" />
          <Field label="Card fee %" value={String(restaurant?.payments?.card_fee_pct || '')} onChangeText={(v: string) => setPayment('card_fee_pct', v)} keyboardType="decimal-pad" testID="settings-card-fee" />
        </Card>
        <View style={{ marginTop: 18 }}>
          <Button title="Save settings" onPress={save} loading={saving} testID="save-restaurant-settings" />
        </View>
        <View style={{ marginTop: 18 }}>
          <Button title="Sign out" variant="secondary" onPress={async () => { await logout(); router.replace('/(auth)/login' as any); }} testID="rest-logout" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textHint}
        style={{
          minHeight: props.multiline ? 72 : 44,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.textPrimary,
          textAlignVertical: props.multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}
