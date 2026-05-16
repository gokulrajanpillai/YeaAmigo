import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiGet } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { Card, StatusBadge, EmptyState } from '../../src/components/UI';
import { Clock } from 'lucide-react-native';

export default function RiderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    try { const o = await apiGet('/orders/mine'); setOrders(o.filter((x: any) => x.status === 'delivered')); } catch {}
    finally { setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const total = orders.reduce((s, o) => s + o.delivery_fee, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Delivery History</Text>
        <View style={styles.summary}>
          <View><Text style={{ color: colors.textMuted, fontSize: 12 }}>Total earnings</Text><Text style={{ fontSize: 24, fontWeight: '800', color: colors.brand }}>£{total.toFixed(2)}</Text></View>
          <View><Text style={{ color: colors.textMuted, fontSize: 12 }}>Deliveries</Text><Text style={{ fontSize: 24, fontWeight: '800' }}>{orders.length}</Text></View>
        </View>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />} contentContainerStyle={{ padding: space.lg }}>
        {orders.length === 0 ? (
          <EmptyState icon={<Clock size={64} color={colors.textHint} />} title="No deliveries yet" subtitle="Past deliveries will appear here" />
        ) : orders.map(o => (
          <Card key={o.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>{o.order_ref}</Text>
              <StatusBadge status={o.status} />
            </View>
            <Text style={{ marginTop: 6 }}>{o.restaurant_name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{new Date(o.created_at).toLocaleString()}</Text>
            <Text style={{ color: colors.brand, fontWeight: '700', marginTop: 6 }}>+£{o.delivery_fee.toFixed(2)}</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  summary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.brandLight, padding: 18, borderRadius: radius.lg, marginTop: 14 },
});
