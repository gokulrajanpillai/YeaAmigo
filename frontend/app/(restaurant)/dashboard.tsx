import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiGet, apiPatch } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { Button, StatusBadge, Card } from '../../src/components/UI';
import { useAuth } from '../../src/auth';

export default function RestaurantDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await apiGet('/restaurants/owner/mine').catch(() => null);
      if (r) setRestaurant(r);
      const o = await apiGet('/orders/mine');
      setOrders(o);
    } catch {} finally { setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]));

  const toggleOpen = async () => {
    if (!restaurant) return;
    const r = await apiPatch(`/restaurants/${restaurant.id}`, { is_open: !restaurant.is_open });
    setRestaurant(r);
  };

  const advance = async (id: string, status: string) => {
    try { await apiPatch(`/orders/${id}/status`, { status }); load(); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  const today = new Date().toDateString();
  const todays = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pending = orders.filter(o => o.status === 'pending').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Welcome back</Text>
            <Text style={{ fontSize: 22, fontWeight: '700' }}>{restaurant?.name || 'Restaurant'}</Text>
          </View>
          <TouchableOpacity testID="logout-restaurant" onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
            <Text style={{ color: colors.brand, fontWeight: '600' }}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {restaurant && !restaurant.approved && (
          <View style={{ backgroundColor: colors.amberLight, padding: 12, borderRadius: radius.md, marginTop: 14 }}>
            <Text style={{ color: '#A85C00', fontWeight: '600' }}>⏳ Pending admin approval</Text>
            <Text style={{ color: '#A85C00', fontSize: 13, marginTop: 4 }}>You'll be able to receive orders once approved.</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <Stat label="Today" value={todays.length.toString()} />
          <Stat label="Pending" value={pending.toString()} highlight />
          <Stat label="Active" value={active.length.toString()} />
        </View>

        {restaurant && (
          <View style={[styles.toggleCard, { backgroundColor: restaurant.is_open ? colors.successLight : colors.dangerLight }]}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: restaurant.is_open ? '#0F6A4F' : '#7D2B2B' }}>
                {restaurant.is_open ? 'OPEN — accepting orders' : 'CLOSED'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Tap to {restaurant.is_open ? 'pause' : 'resume'}</Text>
            </View>
            <TouchableOpacity testID="open-toggle" onPress={toggleOpen} style={[styles.bigToggle, { backgroundColor: restaurant.is_open ? colors.success : colors.danger }]}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{restaurant.is_open ? 'Close' : 'Open'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.section}>Live orders</Text>
        {active.length === 0 ? (
          <Text style={{ color: colors.textMuted, padding: 14 }}>No live orders yet. New orders will appear here.</Text>
        ) : active.map(o => (
          <Card key={o.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Courier New', fontWeight: '700' }}>{o.order_ref}</Text>
              <StatusBadge status={o.status} />
            </View>
            <Text style={{ marginTop: 6, color: colors.textMuted, fontSize: 12 }}>{o.customer_name?.split(' ')[0]} · {new Date(o.created_at).toLocaleTimeString()}</Text>
            <Text style={{ marginTop: 8 }}>{o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(', ')}</Text>
            <Text style={{ fontWeight: '700', color: colors.brand, marginTop: 8 }}>₹{o.total_gbp.toFixed(2)}</Text>

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 } as any}>
              {o.status === 'pending' && (
                <>
                  <Button testID={`confirm-${o.id}`} title="Confirm" onPress={() => advance(o.id, 'confirmed')} style={{ flex: 1, marginRight: 6 }} />
                  <Button testID={`reject-${o.id}`} title="Reject" variant="danger" onPress={() => advance(o.id, 'cancelled')} style={{ flex: 1 }} />
                </>
              )}
              {o.status === 'confirmed' && <Button testID={`prep-${o.id}`} title="Start preparing" onPress={() => advance(o.id, 'preparing')} style={{ flex: 1 }} />}
              {o.status === 'preparing' && <Button testID={`ready-${o.id}`} title="Mark ready" onPress={() => advance(o.id, 'ready')} style={{ flex: 1 }} />}
              {o.status === 'ready' && <Text style={{ color: colors.brand, fontWeight: '600' }}>Awaiting rider pickup...</Text>}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: highlight ? colors.brandLight : colors.bgSurface, padding: 14, borderRadius: radius.md, marginRight: 8 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: highlight ? colors.brand : colors.textPrimary }}>{value}</Text>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', marginTop: 18 },
  toggleCard: { marginTop: 14, padding: 16, borderRadius: radius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bigToggle: { paddingHorizontal: 20, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 22, marginBottom: 10 },
});
