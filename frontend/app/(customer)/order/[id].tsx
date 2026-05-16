import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { apiGet, apiPatch, apiPost } from '../../../src/api';
import { colors, radius, space, STATUS_META } from '../../../src/theme';
import { Button, StatusBadge } from '../../../src/components/UI';

const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'en_route', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  pending: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing',
  ready: 'Ready', assigned: 'Rider assigned', en_route: 'On the way', delivered: 'Delivered',
};

const MESSAGES: Record<string, string> = {
  pending: 'Waiting for the restaurant to confirm your order...',
  confirmed: 'Great! The restaurant has confirmed your order.',
  preparing: 'Your food is being freshly prepared.',
  ready: 'Your food is ready and waiting for a rider.',
  assigned: 'A rider has been assigned. They are heading to the restaurant.',
  en_route: 'Your order is on the way!',
  delivered: 'Order delivered. Enjoy your food!',
  cancelled: 'This order was cancelled.',
};

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [food, setFood] = useState(5);
  const [delivery, setDelivery] = useState(5);
  const [comment, setComment] = useState('');
  const pollRef = useRef<any>(null);

  const load = useCallback(async () => {
    try { const o = await apiGet(`/orders/${id}`); setOrder(o); } catch {}
  }, [id]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 4000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const cancel = async () => {
    Alert.alert('Cancel order?', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try { await apiPatch(`/orders/${id}/status`, { status: 'cancelled' }); load(); } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const submitReview = async () => {
    try {
      await apiPost('/reviews', { order_id: id, food_rating: food, delivery_rating: delivery, comment });
      Alert.alert('Thank you!', 'Your review was submitted.');
      setShowReview(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  if (!order) return <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}><Text style={{ padding: 24 }}>Loading...</Text></SafeAreaView>;

  const stepIdx = STEPS.indexOf(order.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity testID="track-back" onPress={() => router.replace('/(customer)/orders' as any)}><ArrowLeft size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={{ fontSize: 13, fontFamily: 'Courier New', fontWeight: '700' }}>{order.order_ref}</Text>
        <StatusBadge status={order.status} testID="order-status" />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>{order.restaurant_name}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>£{order.total_gbp.toFixed(2)} · {order.items.length} item(s)</Text>

        {order.status !== 'cancelled' && (
          <View style={styles.progressBox}>
            {STEPS.map((s, i) => (
              <View key={s} style={{ flex: 1, alignItems: 'center' }}>
                <View style={[styles.dot, i <= stepIdx && styles.dotActive, i === stepIdx && styles.dotCurrent]}>
                  {i < stepIdx && <CheckCircle2 size={12} color="#fff" />}
                </View>
                <Text style={[styles.stepLabel, i <= stepIdx && { color: colors.brand, fontWeight: '700' }]} numberOfLines={1}>{STEP_LABELS[s]}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.messageBox}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, lineHeight: 22 }}>{MESSAGES[order.status]}</Text>
          {order.rider_name && order.status === 'en_route' && (
            <Text style={{ color: colors.brand, marginTop: 6, fontWeight: '600' }}>Rider: {order.rider_name}</Text>
          )}
        </View>

        {(order.status === 'assigned' || order.status === 'en_route') && (
          <View style={styles.mapBox}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800' }} style={{ width: '100%', height: 180 }} />
            <View style={styles.pinR}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>🍴 Restaurant</Text></View>
            <View style={styles.pinC}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>🏠 You</Text></View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((it: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <Text style={{ fontWeight: '500' }}>{it.quantity}× {it.name}</Text>
              <Text style={{ color: colors.textMuted }}>£{(it.price_gbp * it.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.itemRow, { borderTopWidth: 0.5, borderColor: colors.borderSubtle, paddingTop: 10, marginTop: 6 }]}>
            <Text style={{ fontWeight: '700' }}>Total</Text>
            <Text style={{ fontWeight: '700', color: colors.brand }}>£{order.total_gbp.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery address</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>{order.delivery_address}</Text>
        </View>

        {['pending', 'confirmed', 'preparing'].includes(order.status) && (
          <Button title="Cancel Order" variant="danger" onPress={cancel} testID="cancel-order-btn" style={{ marginTop: 14 }} />
        )}

        {order.status === 'delivered' && !showReview && (
          <Button title="Rate your order" onPress={() => setShowReview(true)} testID="rate-btn" style={{ marginTop: 14 }} />
        )}

        {showReview && (
          <View style={styles.reviewBox}>
            <Text style={styles.sectionTitle}>Rate your order</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Food</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} testID={`food-${n}`} onPress={() => setFood(n)}>
                  <Text style={{ fontSize: 28, marginRight: 4 }}>{n <= food ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>Delivery</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} testID={`delivery-${n}`} onPress={() => setDelivery(n)}>
                  <Text style={{ fontSize: 28, marginRight: 4 }}>{n <= delivery ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, padding: 10, marginTop: 12 }}>
              <TextInput testID="review-comment" value={comment} onChangeText={setComment} placeholder="Optional comment" placeholderTextColor={colors.textHint} multiline />
            </View>
            <Button title="Submit review" onPress={submitReview} testID="submit-review" style={{ marginTop: 14 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg, borderBottomWidth: 0.5, borderColor: colors.borderSubtle },
  progressBox: { flexDirection: 'row', marginTop: 18 },
  dot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  dotActive: { backgroundColor: colors.brand },
  dotCurrent: { transform: [{ scale: 1.15 }], shadowColor: colors.brand, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  stepLabel: { fontSize: 9, color: colors.textHint, marginTop: 6, textAlign: 'center' },
  messageBox: { backgroundColor: colors.brandLight, padding: 16, borderRadius: radius.md, marginTop: 18 },
  mapBox: { marginTop: 14, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bgSurface, position: 'relative' },
  pinR: { position: 'absolute', top: 16, left: 16, backgroundColor: colors.brand, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  pinC: { position: 'absolute', bottom: 16, right: 16, backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  section: { marginTop: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  reviewBox: { marginTop: 18, padding: 16, backgroundColor: colors.bgSurface, borderRadius: radius.md },
});
