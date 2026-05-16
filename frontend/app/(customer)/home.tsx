import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MapPin, Star, Search, Clock } from 'lucide-react-native';
import { apiGet } from '../../src/api';
import { colors, radius, space, shadow } from '../../src/theme';
import { Chip, Skeleton } from '../../src/components/UI';

const CUISINES = ['All', 'Pizza', 'Italian', 'Indian', 'Vegan', 'Chinese', 'Burgers', 'Thai'];

export default function CustomerHome() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const items = await apiGet('/restaurants');
      setData(items);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = filter === 'All' ? data : data.filter(r => (r.cuisine_tags || []).includes(filter));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand} />}
        contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MapPin size={16} color={colors.brand} />
            <Text style={{ marginLeft: 4, color: colors.textMuted, fontSize: 12 }}>Delivering to</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>London E1 6RF</Text>

          <View style={styles.searchBar}>
            <Search size={18} color={colors.textHint} />
            <Text style={{ marginLeft: 10, color: colors.textHint, fontSize: 14 }}>Search restaurants or dishes...</Text>
          </View>

          <Text style={{ fontSize: 22, fontWeight: '700', marginTop: space.lg }}>
            Good food, <Text style={{ color: colors.brand }}>great amigos.</Text>
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
            {data.length} restaurants near you
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingVertical: space.lg }}>
          {CUISINES.map(c => (
            <Chip key={c} label={c} active={filter === c} onPress={() => setFilter(c)} testID={`chip-${c}`} />
          ))}
        </ScrollView>

        {loading ? (
          <View style={{ paddingHorizontal: space.lg }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={{ marginBottom: 14 }}>
                <Skeleton height={160} style={{ borderRadius: radius.lg }} />
                <Skeleton height={14} width={'60%'} style={{ marginTop: 8 }} />
                <Skeleton height={12} width={'40%'} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => it.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: space.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                testID={`restaurant-${item.id}`}
                onPress={() => router.push(`/(customer)/restaurant/${item.id}` as any)}
                style={styles.card}>
                <Image source={{ uri: item.banner_url }} style={styles.banner} />
                {!item.is_open && (
                  <View style={styles.closedOverlay}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Currently closed</Text>
                  </View>
                )}
                <Image source={{ uri: item.logo_url }} style={styles.logo} />
                <View style={{ padding: space.lg }}>
                  <Text style={styles.restName}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Star size={14} color={colors.amber} fill={colors.amber} />
                    <Text style={{ marginLeft: 4, fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>
                      {item.rating?.toFixed(1) || '—'}
                    </Text>
                    <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textMuted }}>
                      · {(item.cuisine_tags || []).slice(0, 2).join(' · ')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Clock size={14} color={colors.textMuted} />
                    <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textMuted }}>
                      {item.avg_prep_mins}–{item.avg_prep_mins + 15} min · £1.99 delivery
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSurface, paddingHorizontal: 14, height: 44, borderRadius: radius.pill, marginTop: 14 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, marginBottom: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: colors.borderSubtle, ...shadow.sm },
  banner: { width: '100%', height: 160, backgroundColor: colors.bgSurface },
  closedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  logo: { position: 'absolute', top: 130, left: 14, width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: '#fff', backgroundColor: colors.bgSurface },
  restName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
});
