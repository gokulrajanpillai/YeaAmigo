import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Bike, Zap, MapPin } from 'lucide-react-native';
import { apiGet, apiPatch, apiPost } from '../../src/api';
import { colors, radius, space, shadow } from '../../src/theme';
import { Button, Card, StatusBadge } from '../../src/components/UI';
import { useAuth } from '../../src/auth';

export default function RiderHome() {
  const { user, logout } = useAuth();
  const [online, setOnline] = useState(false);
  const [available, setAvailable] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await apiGet('/rider/status');
      setOnline(!!s?.is_online);
      const av = await apiGet('/orders/available');
      setAvailable(av);
      const mine = await apiGet('/orders/mine');
      setActive(mine.filter((o: any) => ['assigned', 'en_route'].includes(o.status)));
      const today = new Date().toDateString();
      setTodayCount(mine.filter((o: any) => o.status === 'delivered' && new Date(o.created_at).toDateString() === today).length);
    } catch {} finally { setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]));

  const toggle = async () => {
    const res = await apiPatch('/rider/online', { is_online: !online });
    setOnline(res.is_online);
  };

  const accept = async (id: string) => {
    try { await apiPost(`/orders/${id}/accept`, {}); load(); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  const advance = async (id: string, status: string) => {
    try { await apiPatch(`/orders/${id}/status`, { status }); load(); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: online ? '#fff' : colors.bgSurface }} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 80 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Hello,</Text>
            <Text style={{ fontSize: 22, fontWeight: '700' }}>{user?.full_name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={async () => { await logout(); }}><Text style={{ color: colors.brand, fontWeight: '600' }}>Sign out</Text></TouchableOpacity>
        </View>

        <TouchableOpacity testID="online-toggle" onPress={toggle} style={[styles.bigToggle, { backgroundColor: online ? colors.success : colors.brand }]}>
          <Zap size={22} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginLeft: 10 }}>
            {online ? 'YOU ARE ONLINE' : 'GO ONLINE'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', marginTop: 18 }}>
          <Stat label="Deliveries today" value={todayCount.toString()} />
          <Stat label="Earnings" value={`£${(todayCount * 1.99).toFixed(2)}`} highlight />
        </View>

        {active.length > 0 && (
          <>
            <Text style={styles.section}>Active delivery</Text>
            {active.map(o => (
              <Card key={o.id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700' }}>{o.order_ref}</Text>
                  <StatusBadge status={o.status} />
                </View>
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={14} color={colors.brand} />
                  <Text style={{ marginLeft: 6, fontWeight: '600' }}>{o.restaurant_name}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>→ {o.delivery_address}</Text>
                {o.status === 'assigned' && <Button testID={`pickup-${o.id}`} title="Confirm Pickup" onPress={() => advance(o.id, 'en_route')} style={{ marginTop: 12 }} />}
                {o.status === 'en_route' && <Button testID={`deliver-${o.id}`} title="Confirm Delivery" onPress={() => advance(o.id, 'delivered')} style={{ marginTop: 12 }} />}
              </Card>
            ))}
          </>
        )}

        {online && (
          <>
            <Text style={styles.section}>Available orders ({available.length})</Text>
            {available.length === 0 ? (
              <Text style={{ color: colors.textMuted, padding: 12 }}>Waiting for new orders to arrive...</Text>
            ) : available.map(o => (
              <Card key={o.id} style={{ marginBottom: 10, borderColor: colors.brand, borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700' }}>{o.order_ref}</Text>
                  <Text style={{ color: colors.brand, fontWeight: '700' }}>~£{o.delivery_fee.toFixed(2)}</Text>
                </View>
                <Text style={{ marginTop: 6, fontWeight: '600' }}>{o.restaurant_name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>→ {o.delivery_address}</Text>
                <Button testID={`accept-${o.id}`} title="Accept" onPress={() => accept(o.id)} style={{ marginTop: 12 }} />
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: highlight ? colors.brandLight : '#fff', padding: 14, borderRadius: radius.md, marginRight: 8, borderWidth: 0.5, borderColor: colors.borderSubtle }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: highlight ? colors.brand : colors.textPrimary }}>{value}</Text>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bigToggle: { marginTop: 24, height: 80, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', ...shadow.md },
  section: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 10 },
});
