import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MapPin, Star, Search, Clock, ChevronDown } from 'lucide-react-native';
import { apiGet } from '../../src/api';
import { colors, radius, space, shadow } from '../../src/theme';
import { Chip, Skeleton, EmptyState, Button } from '../../src/components/UI';
import { useI18n } from '../../src/i18n';
import { useAddress, shortAddress } from '../../src/address';
import { Penguin } from '../../src/components/Mascot';

const CUISINES = ['All', 'Pizza', 'Italian', 'Indian', 'Vegan', 'Chinese', 'Burgers', 'Thai'];

export default function CustomerHome() {
  const router = useRouter();
  const { t, tn } = useI18n();
  const { active } = useAddress();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const items = await apiGet('/restaurants');
      setData(items);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = data.filter(r => {
    const matchesCuisine = filter === 'All' || (r.cuisine_tags || []).includes(filter);
    const q = query.trim().toLowerCase();
    if (!q) return matchesCuisine;
    const haystack = [
      r.name,
      r.description,
      ...(r.cuisine_tags || []),
      r.search_terms || '',
    ].join(' ').toLowerCase();
    return matchesCuisine && haystack.includes(q);
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand} />}
        contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              testID="open-address"
              onPress={() => router.push('/(customer)/address' as any)}
              style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <MapPin size={16} color={colors.brand} />
                <Text style={{ marginLeft: 4, color: colors.textMuted, fontSize: 12 }}>{t('delivering_to')}</Text>
                <ChevronDown size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
              </View>
              <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
                {active.title} · {shortAddress(active)}
              </Text>
            </TouchableOpacity>
            <Penguin size={48} mood="happy" />
          </View>

          <View style={styles.searchBar}>
            <Search size={18} color={colors.textHint} />
            <TextInput
              testID="restaurant-dish-search"
              value={query}
              onChangeText={setQuery}
              placeholder={t('search_placeholder')}
              placeholderTextColor={colors.textHint}
              autoCapitalize="none"
              style={{ flex: 1, marginLeft: 10, color: colors.textPrimary, fontSize: 14, paddingVertical: 0 }}
            />
          </View>

          <Text style={{ fontSize: 24, fontWeight: '800', marginTop: space.lg, color: colors.textPrimary }}>
            {t('hero_line1')} <Text style={{ color: colors.brand }}>{t('hero_line2')}</Text>
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
            {data.length} {t('restaurants_near')}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingVertical: space.lg }}>
          {CUISINES.map(c => (
            <Chip key={c} label={tn(c)} active={filter === c} onPress={() => setFilter(c)} testID={`chip-${c}`} />
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
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Penguin size={120} mood="searching" role="customer" animated />}
            title={t('loading')}
            subtitle={t('search_placeholder')}
            action={<Button title={t('browse_restaurants')} onPress={() => setFilter('All')} />}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => it.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: space.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                testID={`restaurant-${item.id}`}
                onPress={() => router.push(`/(customer)/restaurant/${item.id}` as any)}
                style={styles.card}>
                <Image source={{ uri: item.banner_url }} style={styles.banner} />
                {!item.is_open && (
                  <View style={styles.closedOverlay}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{t('closed_label')}</Text>
                  </View>
                )}
                <Image source={{ uri: item.logo_url }} style={styles.logo} />
                <View style={{ padding: space.lg }}>
                  <Text style={styles.restName}>{tn(item.name)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Star size={14} color={colors.accent} fill={colors.accent} />
                    <Text style={{ marginLeft: 4, fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>
                      {item.rating?.toFixed(1) || '—'}
                    </Text>
                    <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textMuted }}>
                      · {(item.cuisine_tags || []).slice(0, 2).map((c: string) => tn(c)).join(' · ')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Clock size={14} color={colors.textMuted} />
                    <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textMuted }}>
                      {item.avg_prep_mins}–{item.avg_prep_mins + 15} {t('min_word')} · ₹49 {t('delivery_fee_short')}
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
