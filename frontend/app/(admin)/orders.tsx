import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiGet } from '../../src/api';
import { colors, space } from '../../src/theme';
import { Card, StatusBadge } from '../../src/components/UI';
export default function AdminOrders() {
  const [items, setItems] = useState<any[]>([]);
  const load = useCallback(async () => { try { setItems(await apiGet('/orders/mine')); } catch {} }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg }}><Text style={{ fontSize: 22, fontWeight: '700' }}>All Orders ({items.length})</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg }}>
        {items.map(o => (
          <Card key={o.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Courier New', fontWeight: '700' }}>{o.order_ref}</Text>
              <StatusBadge status={o.status} />
            </View>
            <Text style={{ marginTop: 6 }}>{o.restaurant_name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Customer: {o.customer_name}</Text>
            <Text style={{ color: colors.brand, fontWeight: '700', marginTop: 6 }}>₹{o.total_gbp.toFixed(2)}</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
