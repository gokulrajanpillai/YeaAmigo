import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiGet } from '../../src/api';
import { colors, space } from '../../src/theme';
import { Card } from '../../src/components/UI';
export default function AdminUsers() {
  const [items, setItems] = useState<any[]>([]);
  const load = useCallback(async () => { try { setItems(await apiGet('/admin/users')); } catch {} }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg }}><Text style={{ fontSize: 22, fontWeight: '700' }}>Users ({items.length})</Text></View>
      <ScrollView contentContainerStyle={{ padding: space.lg }}>
        {items.map(u => (
          <Card key={u.id} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '600' }}>{u.full_name}</Text>
              <Text style={{ color: colors.brand, fontSize: 12, textTransform: 'uppercase' }}>{u.role?.replace('_', ' ')}</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{u.email}</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
