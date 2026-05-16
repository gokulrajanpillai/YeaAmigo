import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiGet } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { Card } from '../../src/components/UI';
import { useAuth } from '../../src/auth';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const d = await apiGet('/admin/overview'); setData(d); } catch {} finally { setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />} contentContainerStyle={{ padding: space.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View><Text style={{ fontSize: 22, fontWeight: '700' }}>Platform Overview</Text><Text style={{ color: colors.textMuted, fontSize: 13 }}>Yeamigo admin</Text></View>
          <TouchableOpacity onPress={logout}><Text style={{ color: colors.brand, fontWeight: '600' }}>Sign out</Text></TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <Metric label="Revenue (delivered)" value={`£${(data?.revenue_gbp || 0).toFixed(2)}`} accent />
          <Metric label="Total orders" value={data?.total_orders?.toString() || '0'} />
          <Metric label="Active orders" value={data?.active_orders?.toString() || '0'} />
          <Metric label="Delivered" value={data?.delivered_orders?.toString() || '0'} />
          <Metric label="Users" value={data?.total_users?.toString() || '0'} />
          <Metric label="Restaurants" value={data?.total_restaurants?.toString() || '0'} />
        </View>

        {data?.pending_restaurants > 0 && (
          <Card style={{ marginTop: 16, backgroundColor: colors.amberLight, borderColor: colors.amber }}>
            <Text style={{ fontWeight: '700', color: '#A85C00' }}>⏳ {data.pending_restaurants} restaurant(s) awaiting approval</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>Go to Restaurants tab to review</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, accent }: any) {
  return (
    <View style={[styles.metric, accent && { backgroundColor: colors.brandLight }]}>
      <Text style={{ fontSize: 12, color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', color: accent ? colors.brand : colors.textPrimary, marginTop: 4 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, justifyContent: 'space-between' },
  metric: { width: '48%', padding: 16, borderRadius: radius.md, backgroundColor: colors.bgSurface, marginBottom: 12 },
});
