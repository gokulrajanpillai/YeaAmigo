import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiGet, apiPatch } from '../../src/api';
import { colors, radius, space } from '../../src/theme';

export default function MenuBuilder() {
  const [menu, setMenu] = useState<any[]>([]);
  const [restId, setRestId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await apiGet('/restaurants/owner/mine');
      setRestId(r.id);
      const m = await apiGet(`/restaurants/${r.id}/menu`);
      setMenu(m);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleItem = async (item: any) => {
    await apiPatch(`/menu/items/${item.id}`, { ...item, is_available: !item.is_available });
    load();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg, borderBottomWidth: 0.5, borderColor: colors.borderSubtle }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Menu Builder</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>Toggle item availability</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg }}>
        {menu.map(group => (
          <View key={group.category} style={{ marginBottom: 22 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 10 }}>{group.category}</Text>
            {group.items.map((it: any) => (
              <View key={it.id} style={styles.row}>
                {it.image_url && <Image source={{ uri: it.image_url }} style={styles.thumb} />}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>{it.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{it.description}</Text>
                  <Text style={{ color: colors.brand, fontWeight: '700', marginTop: 4 }}>₹{it.price_gbp.toFixed(2)}</Text>
                </View>
                <Switch
                  testID={`toggle-${it.id}`}
                  value={it.is_available}
                  onValueChange={() => toggleItem(it)}
                  trackColor={{ true: colors.brand, false: colors.borderSubtle }}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: colors.borderSubtle },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.bgSurface },
});
