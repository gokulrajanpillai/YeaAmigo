import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Minus, Trash2, ArrowLeft } from 'lucide-react-native';
import { Cart, loadCart, saveCart, apiPost } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { Button, EmptyState } from '../../src/components/UI';

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [address, setAddress] = useState('221B Baker Street, London NW1 6XE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => { loadCart().then(setCart); }, []));

  const change = async (item_id: string, delta: number) => {
    if (!cart) return;
    const items = cart.items.map(it => it.item_id === item_id ? { ...it, quantity: it.quantity + delta } : it).filter(it => it.quantity > 0);
    if (!items.length) { await saveCart(null); setCart(null); return; }
    const next = { ...cart, items };
    await saveCart(next); setCart(next);
  };

  const place = async () => {
    if (!cart) return;
    if (!address.trim()) { Alert.alert('Address required'); return; }
    setLoading(true);
    try {
      const order = await apiPost('/orders', {
        restaurant_id: cart.restaurant_id,
        items: cart.items,
        delivery_address: address,
        delivery_notes: notes,
      });
      await saveCart(null);
      router.replace(`/(customer)/order/${order.id}` as any);
    } catch (e: any) { Alert.alert('Order failed', e.message); }
    finally { setLoading(false); }
  };

  const subtotal = cart?.items.reduce((s, it) => s + it.price_gbp * it.quantity, 0) || 0;
  const fee = 49.0;
  const total = subtotal + fee;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity testID="cart-back" onPress={() => router.back()}><ArrowLeft size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 22 }} />
      </View>
      {!cart || cart.items.length === 0 ? (
        <EmptyState
          icon={<Text style={{ fontSize: 64 }}>🛍️</Text>}
          title="Cart is empty"
          subtitle="Browse restaurants to start an order"
          action={<Button title="Browse" onPress={() => router.replace('/(customer)/home' as any)} />}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 24 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>Ordering from</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 14 }}>{cart.restaurant_name}</Text>

            {cart.items.map(it => (
              <View key={it.item_id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600' }}>{it.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>₹{it.price_gbp.toFixed(2)} each</Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity testID={`dec-${it.item_id}`} onPress={() => change(it.item_id, -1)} style={styles.qBtn}><Minus size={14} /></TouchableOpacity>
                  <Text style={{ marginHorizontal: 12, fontWeight: '700' }}>{it.quantity}</Text>
                  <TouchableOpacity testID={`inc-${it.item_id}`} onPress={() => change(it.item_id, 1)} style={styles.qBtn}><Plus size={14} /></TouchableOpacity>
                </View>
              </View>
            ))}

            <Text style={styles.label}>Delivery address</Text>
            <View style={styles.input}><TextInput testID="cart-address" value={address} onChangeText={setAddress} style={{ fontSize: 14 }} multiline /></View>

            <Text style={styles.label}>Delivery notes (optional)</Text>
            <View style={styles.input}><TextInput testID="cart-notes" value={notes} onChangeText={setNotes} placeholder="E.g. ring the doorbell" placeholderTextColor={colors.textHint} style={{ fontSize: 14 }} /></View>

            <View style={styles.summary}>
              <View style={styles.sumRow}><Text style={{ color: colors.textMuted }}>Subtotal</Text><Text>₹{subtotal.toFixed(2)}</Text></View>
              <View style={styles.sumRow}><Text style={{ color: colors.textMuted }}>Delivery fee</Text><Text>₹{fee.toFixed(2)}</Text></View>
              <View style={[styles.sumRow, { borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 10, marginTop: 6 }]}>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>Total</Text>
                <Text style={{ fontWeight: '700', fontSize: 16, color: colors.brand }}>₹{total.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>
          <View style={{ padding: space.lg, borderTopWidth: 0.5, borderColor: colors.borderSubtle }}>
            <Button title={`Place Order — ₹${total.toFixed(2)}`} onPress={place} loading={loading} testID="place-order-btn" />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg, borderBottomWidth: 0.5, borderColor: colors.borderSubtle },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: colors.borderSubtle },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSurface, borderRadius: radius.pill, paddingHorizontal: 6, height: 36 },
  qBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 18, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, padding: 12, minHeight: 44 },
  summary: { marginTop: 20, backgroundColor: colors.bgSurface, padding: 14, borderRadius: radius.md },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
