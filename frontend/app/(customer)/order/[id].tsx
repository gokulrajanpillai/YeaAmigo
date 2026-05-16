import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { apiGet, apiPatch, apiPost } from '../../../src/api';
import { colors, radius, space, fmtINR } from '../../../src/theme';
import { Button, StatusBadge } from '../../../src/components/UI';
import { useI18n } from '../../../src/i18n';
import { Penguin } from '../../../src/components/Mascot';

const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'en_route', 'delivered'];

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, tn } = useI18n();
  const [order, setOrder] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [food, setFood] = useState(5);
  const [delivery, setDelivery] = useState(5);
  const [comment, setComment] = useState('');
  const pollRef = useRef<any>(null);

  const STEP_LABELS: Record<string, string> = {
    pending: t('order_placed'), confirmed: t('order_confirmed'), preparing: t('order_preparing'),
    ready: t('order_ready'), assigned: t('order_assigned'), en_route: t('order_enroute'), delivered: t('order_delivered'),
  };
  const MESSAGES: Record<string, string> = {
    pending: t('msg_pending'), confirmed: t('msg_confirmed'), preparing: t('msg_preparing'),
    ready: t('msg_ready'), assigned: t('msg_assigned'), en_route: t('msg_enroute'), delivered: t('msg_delivered'),
    cancelled: t('order_cancelled_msg'),
  };

  const load = useCallback(async () => {
    try { const o = await apiGet(`/orders/${id}`); setOrder(o); } catch {}
  }, [id]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 4000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const cancel = async () => {
    Alert.alert(t('cancel_order') + '?', '', [
      { text: t('no') },
      { text: t('yes'), style: 'destructive', onPress: async () => {
        try { await apiPatch(`/orders/${id}/status`, { status: 'cancelled' }); load(); } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const submitReview = async () => {
    try {
      await apiPost('/reviews', { order_id: id, food_rating: food, delivery_rating: delivery, comment });
      Alert.alert('✓', '');
      setShowReview(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  if (!order) return <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}><Text style={{ padding: 24 }}>{t('loading')}</Text></SafeAreaView>;

  const stepIdx = STEPS.indexOf(order.status);
  const isDelivered = order.status === 'delivered';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity testID="track-back" onPress={() => router.replace('/(customer)/orders' as any)}><ArrowLeft size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={{ fontSize: 13, fontFamily: 'Courier New', fontWeight: '700' }}>{order.order_ref}</Text>
        <StatusBadge status={order.status} testID="order-status" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg }}>
        {(isDelivered || order.status === 'en_route') && (
          <View style={{ alignItems: 'center', marginBottom: 14 }}>
            <Penguin size={100} mood={isDelivered ? 'celebrate' : 'happy'} role="delivery" animated />
          </View>
        )}
        <Text style={{ fontSize: 22, fontWeight: '700' }}>{tn(order.restaurant_name)}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{fmtINR(order.total_gbp)} · {order.items.length}</Text>

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
            <Text style={{ color: colors.brand, marginTop: 6, fontWeight: '600' }}>{t('rider_label')}: {order.rider_name}</Text>
          )}
        </View>

        {(order.status === 'assigned' || order.status === 'en_route') && (
          <View style={styles.mapBox}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800' }} style={{ width: '100%', height: 180 }} />
            <View style={styles.pinR}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>🍴</Text></View>
            <View style={styles.pinC}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>🏠</Text></View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('items_label')}</Text>
          {order.items.map((it: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <Text style={{ fontWeight: '500' }}>{it.quantity}× {tn(it.name)}</Text>
              <Text style={{ color: colors.textMuted }}>{fmtINR(it.price_gbp * it.quantity)}</Text>
            </View>
          ))}
          <View style={[styles.itemRow, { borderTopWidth: 0.5, borderColor: colors.borderSubtle, paddingTop: 10, marginTop: 6 }]}>
            <Text style={{ fontWeight: '700' }}>{t('total')}</Text>
            <Text style={{ fontWeight: '700', color: colors.brand }}>{fmtINR(order.total_gbp)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('delivery_address')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>{order.delivery_address}</Text>
        </View>

        {['pending', 'confirmed', 'preparing'].includes(order.status) && (
          <Button title={t('cancel_order')} variant="danger" onPress={cancel} testID="cancel-order-btn" style={{ marginTop: 14 }} />
        )}

        {isDelivered && !showReview && (
          <Button title={t('rate_order')} onPress={() => setShowReview(true)} testID="rate-btn" style={{ marginTop: 14 }} />
        )}

        {showReview && (
          <View style={styles.reviewBox}>
            <Text style={styles.sectionTitle}>{t('rate_order')}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>{t('food_rating')}</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} testID={`food-${n}`} onPress={() => setFood(n)}>
                  <Text style={{ fontSize: 28, marginRight: 4 }}>{n <= food ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>{t('delivery_rating')}</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} testID={`delivery-${n}`} onPress={() => setDelivery(n)}>
                  <Text style={{ fontSize: 28, marginRight: 4 }}>{n <= delivery ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, padding: 10, marginTop: 12 }}>
              <TextInput testID="review-comment" value={comment} onChangeText={setComment} placeholder={t('optional_comment')} placeholderTextColor={colors.textHint} multiline />
            </View>
            <Button title={t('submit_review')} onPress={submitReview} testID="submit-review" style={{ marginTop: 14 }} />
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
