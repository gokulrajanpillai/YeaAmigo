import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { apiGet } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { StatusBadge, EmptyState, Button } from '../../src/components/UI';

export default function CustomerOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const data = await apiGet('/orders/mine'); setOrders(data); } catch {}
    finally { setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = orders.filter(o => tab === 'active'
    ? !['delivered', 'cancelled'].includes(o.status)
    : ['delivered', 'cancelled'].includes(o.status));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg }}>
        <Text style={styles.h1}>Your Orders</Text>
        <View style={styles.tabs}>
          <TouchableOpacity testID="tab-active" onPress={() => setTab('active')} style={[styles.tab, tab === 'active' && styles.tabActive]}>
            <Text style={[styles.tabTxt, tab === 'active' && styles.tabTxtActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="tab-past" onPress={() => setTab('past')} style={[styles.tab, tab === 'past' && styles.tabActive]}>
            <Text style={[styles.tabTxt, tab === 'past' && styles.tabTxtActive]}>Past</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: space.lg, paddingTop: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={64} color={colors.textHint} />}
            title="No orders yet"
            subtitle="Your order history will appear here"
            action={<Button title="Browse restaurants" onPress={() => router.replace('/(customer)/home' as any)} />}
          />
        ) : (
          filtered.map(o => (
            <TouchableOpacity key={o.id} testID={`order-${o.id}`} onPress={() => router.push(`/(customer)/order/${o.id}` as any)} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>{o.restaurant_name}</Text>
                <StatusBadge status={o.status} />
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{o.order_ref} · {new Date(o.created_at).toLocaleString()}</Text>
              <Text style={{ marginTop: 8, color: colors.textPrimary }}>{o.items.slice(0, 2).map((i: any) => `${i.quantity}× ${i.name}`).join(', ')}{o.items.length > 2 ? ` and ${o.items.length - 2} more` : ''}</Text>
              <Text style={{ marginTop: 8, fontWeight: '700', color: colors.brand }}>₹{o.total_gbp.toFixed(2)}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700' },
  tabs: { flexDirection: 'row', marginTop: 14, backgroundColor: colors.bgSurface, padding: 4, borderRadius: radius.pill },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabTxt: { color: colors.textMuted, fontWeight: '600' },
  tabTxtActive: { color: colors.textPrimary },
  card: { backgroundColor: '#fff', borderWidth: 0.5, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: 16, marginBottom: 12 },
});
