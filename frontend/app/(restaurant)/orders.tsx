import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiGet } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { StatusBadge, Card } from '../../src/components/UI';

const LANES = ['pending', 'preparing', 'ready', 'en_route', 'delivered'];

export default function RestaurantOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const o = await apiGet('/orders/mine'); setOrders(o); } catch {} finally { setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg, borderBottomWidth: 0.5, borderColor: colors.borderSubtle }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Order Queue</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{orders.length} orders total</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: space.lg }}>
        {LANES.map(lane => {
          const items = orders.filter(o => o.status === lane || (lane === 'en_route' && o.status === 'assigned'));
          return (
            <View key={lane} style={styles.lane}>
              <Text style={styles.laneTitle}>{lane.toUpperCase()} <Text style={{ color: colors.textMuted }}>({items.length})</Text></Text>
              {items.length === 0 ? (
                <Text style={{ color: colors.textHint, padding: 10, fontSize: 12 }}>No orders</Text>
              ) : items.map(o => (
                <Card key={o.id} style={{ marginBottom: 10 }}>
                  <Text style={{ fontFamily: 'Courier New', fontSize: 12, fontWeight: '700' }}>{o.order_ref}</Text>
                  <Text style={{ marginTop: 6, fontSize: 13 }}>{o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(', ')}</Text>
                  <View style={{ marginTop: 8 }}><StatusBadge status={o.status} /></View>
                  <Text style={{ color: colors.brand, fontWeight: '700', marginTop: 8 }}>₹{o.total_gbp.toFixed(2)}</Text>
                </Card>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lane: { width: 260, backgroundColor: colors.bgSurface, borderRadius: radius.md, padding: 12, marginRight: 12 },
  laneTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
});
