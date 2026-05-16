import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiGet, apiPatch } from '../../src/api';
import { colors, space } from '../../src/theme';
import { Card, Button } from '../../src/components/UI';

export default function AdminRestaurants() {
  const [items, setItems] = useState<any[]>([]);
  const load = useCallback(async () => { try { setItems(await apiGet('/admin/restaurants')); } catch {} }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const approve = async (id: string) => {
    try { await apiPatch(`/admin/restaurants/${id}/approve`, {}); load(); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg }}><Text style={{ fontSize: 22, fontWeight: '700' }}>Restaurants</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg }}>
        {items.map(r => (
          <Card key={r.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', fontSize: 16 }}>{r.name}</Text>
              <Text style={{ color: r.approved ? colors.success : colors.amber, fontWeight: '700', fontSize: 12 }}>
                {r.approved ? '✓ APPROVED' : '⏳ PENDING'}
              </Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{r.address}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{(r.cuisine_tags || []).join(' · ')}</Text>
            {!r.approved && (
              <Button title="Approve" onPress={() => approve(r.id)} style={{ marginTop: 10 }} testID={`approve-${r.id}`} />
            )}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
