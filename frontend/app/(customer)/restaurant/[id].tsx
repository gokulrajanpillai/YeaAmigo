import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Minus, Heart, Star, Clock } from 'lucide-react-native';
import { apiGet, loadCart, saveCart } from '../../../src/api';
import { colors, radius, space, shadow } from '../../../src/theme';
import { Button, Skeleton } from '../../../src/components/UI';

export default function RestaurantPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [rest, setRest] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const refreshCart = useCallback(async () => {
    const c = await loadCart();
    if (c && c.restaurant_id === id) {
      setCartCount(c.items.reduce((s, it) => s + it.quantity, 0));
      setCartTotal(c.items.reduce((s, it) => s + it.price_gbp * it.quantity, 0));
    } else { setCartCount(0); setCartTotal(0); }
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiGet(`/restaurants/${id}`);
        const m = await apiGet(`/restaurants/${id}/menu`);
        setRest(r); setMenu(m);
      } finally { setLoading(false); }
      refreshCart();
    })();
  }, [id, refreshCart]);

  const addToCart = async () => {
    if (!selectedItem) return;
    const existing = await loadCart();
    let cart = existing && existing.restaurant_id === id
      ? existing
      : { restaurant_id: id!, restaurant_name: rest.name, items: [] };
    if (existing && existing.restaurant_id !== id) {
      // Different restaurant - confirm clear
      Alert.alert('Start new order?', `You have items from ${existing.restaurant_name}. Clear and start with ${rest.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: async () => {
          cart = { restaurant_id: id!, restaurant_name: rest.name, items: [] };
          cart.items.push({ item_id: selectedItem.id, name: selectedItem.name, price_gbp: selectedItem.price_gbp, quantity: qty, image_url: selectedItem.image_url });
          await saveCart(cart);
          setSelectedItem(null); setQty(1); refreshCart();
        }},
      ]);
      return;
    }
    const idx = cart.items.findIndex(it => it.item_id === selectedItem.id);
    if (idx >= 0) cart.items[idx].quantity += qty;
    else cart.items.push({ item_id: selectedItem.id, name: selectedItem.name, price_gbp: selectedItem.price_gbp, quantity: qty, image_url: selectedItem.image_url });
    await saveCart(cart);
    setSelectedItem(null); setQty(1); refreshCart();
  };

  if (loading || !rest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ padding: space.lg }}><Skeleton height={200} /><Skeleton height={20} style={{ marginTop: 12 }} /></View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: cartCount > 0 ? 100 : 24 }}>
        <View>
          <Image source={{ uri: rest.banner_url }} style={{ width: '100%', height: 220, backgroundColor: colors.bgSurface }} />
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: space.lg }}>
              <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={20} color="#fff" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}><Heart size={20} color="#fff" /></TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ paddingHorizontal: space.lg, marginTop: -30 }}>
          <View style={[styles.infoCard, shadow.sm]}>
            <Text style={styles.restName}>{rest.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Star size={14} color={colors.amber} fill={colors.amber} />
              <Text style={{ marginLeft: 4, fontSize: 13, fontWeight: '600' }}>{rest.rating?.toFixed(1)}</Text>
              <Text style={{ marginLeft: 8, color: colors.textMuted, fontSize: 13 }}>{(rest.cuisine_tags || []).join(' · ')}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <View style={styles.infoChip}><Clock size={14} color={colors.brand} /><Text style={styles.infoChipTxt}>{rest.avg_prep_mins}–{rest.avg_prep_mins + 15} min</Text></View>
              <View style={styles.infoChip}><Text style={styles.infoChipTxt}>₹49 delivery</Text></View>
              <View style={styles.infoChip}><Text style={styles.infoChipTxt}>Hygiene {rest.hygiene_score}/5</Text></View>
            </View>
            <Text style={{ marginTop: 10, color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{rest.description}</Text>
          </View>
        </View>

        {menu.map(group => (
          <View key={group.category} style={{ marginTop: space.xl, paddingHorizontal: space.lg }}>
            <Text style={styles.catTitle}>{group.category}</Text>
            {group.items.map((it: any) => (
              <TouchableOpacity
                key={it.id} testID={`menu-item-${it.id}`}
                onPress={() => { setSelectedItem(it); setQty(1); }}
                style={styles.itemRow}>
                <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <Text style={styles.itemName} numberOfLines={1}>{it.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{it.description}</Text>
                  <Text style={styles.itemPrice}>₹{it.price_gbp.toFixed(0)}</Text>
                </View>
                {it.image_url ? <Image source={{ uri: it.image_url }} style={styles.itemImg} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {cartCount > 0 && (
        <TouchableOpacity testID="view-cart-bar" onPress={() => router.push('/(customer)/cart' as any)} style={styles.cartBar}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>View cart — {cartCount} item{cartCount > 1 ? 's' : ''}</Text>
          <Text style={{ color: '#fff', fontWeight: '700' }}>₹{cartTotal.toFixed(2)}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={!!selectedItem} animationType="slide" transparent onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.sheetBg}>
          <View style={styles.sheet}>
            <TouchableOpacity testID="sheet-close" onPress={() => setSelectedItem(null)} style={{ alignSelf: 'flex-end' }}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>Close</Text>
            </TouchableOpacity>
            {selectedItem?.image_url && <Image source={{ uri: selectedItem.image_url }} style={styles.sheetImg} />}
            <Text style={styles.sheetName}>{selectedItem?.name}</Text>
            <Text style={styles.sheetDesc}>{selectedItem?.description}</Text>
            {(selectedItem?.dietary_tags?.length > 0) && (
              <Text style={{ color: colors.success, fontSize: 12, marginTop: 6 }}>
                {selectedItem.dietary_tags.join(' · ')}
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl }}>
              <View style={styles.qtyRow}>
                <TouchableOpacity testID="qty-minus" onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}><Minus size={16} color={colors.textPrimary} /></TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: '700', marginHorizontal: 16 }}>{qty}</Text>
                <TouchableOpacity testID="qty-plus" onPress={() => setQty(qty + 1)} style={styles.qtyBtn}><Plus size={16} color={colors.textPrimary} /></TouchableOpacity>
              </View>
            </View>
            <View style={{ marginTop: 14 }}>
              <Button testID="add-to-order" title={`Add ${qty} for ₹${(selectedItem?.price_gbp * qty || 0).toFixed(0)}`} onPress={addToCart} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  infoCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: space.lg, borderWidth: 0.5, borderColor: colors.borderSubtle },
  restName: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, marginRight: 6 },
  infoChipTxt: { color: colors.brandDark, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  catTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  itemRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.borderSubtle, alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  itemDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: colors.brand, marginTop: 8 },
  itemImg: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: colors.bgSurface, flexShrink: 0 },
  cartBar: { position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: colors.brand, borderRadius: radius.lg, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...shadow.md },
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space.xl, maxHeight: '85%' },
  sheetImg: { width: '100%', height: 200, borderRadius: radius.md, marginVertical: 12, backgroundColor: colors.bgSurface },
  sheetName: { fontSize: 22, fontWeight: '700' },
  sheetDesc: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSurface, borderRadius: radius.pill, paddingHorizontal: 8, height: 44 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
