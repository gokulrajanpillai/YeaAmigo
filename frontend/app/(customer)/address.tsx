import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Locate, Home, Briefcase, Bookmark, Plus, Check, Trash2 } from 'lucide-react-native';
import { colors, radius, space, shadow } from '../../src/theme';
import { Button } from '../../src/components/UI';
import { useI18n } from '../../src/i18n';
import { useAddress, Address } from '../../src/address';
import { Penguin } from '../../src/components/Mascot';

// We use OpenStreetMap (Leaflet) inside a WebView/iframe — works on web + native, no API key.
// react-native-webview is mapped to iframe on web by react-native-web; on native it uses real WebView.

const MAP_HTML = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .crosshair { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 1000; pointer-events: none; }
    .crosshair svg { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); }
    .leaflet-control-attribution { font-size: 9px; }
    ::-webkit-scrollbar { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="crosshair">
    <svg width="40" height="56" viewBox="0 0 40 56">
      <path d="M20 0 C8.95 0 0 8.95 0 20 C0 35 20 56 20 56 S40 35 40 20 C40 8.95 31.05 0 20 0 Z" fill="#0B5D5A" />
      <circle cx="20" cy="20" r="7" fill="#E2B43A" />
    </svg>
  </div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OSM' }).addTo(map);

    function post(payload) {
      try { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(payload)); } catch(e) {}
      try { window.parent.postMessage(JSON.stringify(payload), '*'); } catch(e) {}
    }
    function emitCenter() {
      var c = map.getCenter();
      post({ type: 'center', lat: c.lat, lng: c.lng });
    }
    map.on('moveend', emitCenter);
    setTimeout(emitCenter, 200);

    function flyTo(lat, lng) {
      map.flyTo([lat, lng], 17, { animate: true, duration: 0.6 });
    }
    window.addEventListener('message', function(e) {
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'flyTo') flyTo(data.lat, data.lng);
      } catch(err) {}
    });
    // For iOS WebView
    document.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data && data.type === 'flyTo') flyTo(data.lat, data.lng);
      } catch(err) {}
    });
  </script>
</body>
</html>`;

// Reverse geocode using Nominatim (free, no key)
async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' },
    });
    const j = await res.json();
    const a = j.address || {};
    const line1 = [a.road, a.neighbourhood || a.suburb || a.hamlet].filter(Boolean).join(', ') || a.display_name?.split(',')[0] || '';
    const city = a.city || a.town || a.village || a.county || '';
    const pincode = a.postcode || '';
    return { line1, city, pincode, display: j.display_name || '' };
  } catch {
    return { line1: '', city: '', pincode: '', display: '' };
  }
}

// Forward geocode using Nominatim
async function forwardGeocode(query: string) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' },
    });
    return await res.json();
  } catch {
    return [];
  }
}

export default function AddressPicker() {
  const router = useRouter();
  const { t } = useI18n();
  const { addresses, active, setActive, upsert, remove } = useAddress();
  const [mode, setMode] = useState<'list' | 'map' | 'form'>('list');
  const [center, setCenter] = useState({ lat: active.lat, lng: active.lng });
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reverse, setReverse] = useState<{ line1: string; city: string; pincode: string }>({ line1: active.line1, city: active.city, pincode: active.pincode || '' });
  const [form, setForm] = useState<Partial<Address>>({ ...active });
  const [editingId, setEditingId] = useState<string | null>(null);
  const webviewRef = useRef<any>(null);
  const reverseTimer = useRef<any>(null);

  // Web fallback: render the map in an iframe. Native: react-native-webview.
  const [WebViewMod, setWebViewMod] = useState<any>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Dynamic import (avoid web SSR issues)
      import('react-native-webview').then(m => setWebViewMod(() => m.WebView)).catch(() => {});
    }
  }, []);

  // Trigger reverse-geocode whenever map center stabilizes
  useEffect(() => {
    if (mode !== 'map') return;
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(async () => {
      const r = await reverseGeocode(center.lat, center.lng);
      setReverse({ line1: r.line1, city: r.city, pincode: r.pincode });
    }, 500);
    return () => { if (reverseTimer.current) clearTimeout(reverseTimer.current); };
  }, [center.lat, center.lng, mode]);

  const handleWebMessage = useCallback((event: any) => {
    try {
      const raw = typeof event === 'string' ? event : (event?.nativeEvent?.data || event?.data);
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (data?.type === 'center' && typeof data.lat === 'number') {
        setCenter({ lat: data.lat, lng: data.lng });
      }
    } catch {}
  }, []);

  // Web iframe message listener
  useEffect(() => {
    if (Platform.OS !== 'web' || mode !== 'map') return;
    const fn = (e: MessageEvent) => handleWebMessage(e.data);
    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);
  }, [mode, handleWebMessage]);

  const locateCurrent = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web' && (navigator as any).geolocation) {
        (navigator as any).geolocation.getCurrentPosition(
          (pos: any) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setCenter({ lat, lng });
            flyMapTo(lat, lng);
            setLoading(false);
          },
          () => { Alert.alert(t('permission_denied')); setLoading(false); },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      } else {
        // Fallback: use Bengaluru default
        setCenter({ lat: 12.9756, lng: 77.6066 });
        flyMapTo(12.9756, 77.6066);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const flyMapTo = (lat: number, lng: number) => {
    const payload = JSON.stringify({ type: 'flyTo', lat, lng });
    if (Platform.OS === 'web') {
      const iframe = document.querySelector('#yeaamigo-osm-iframe') as HTMLIFrameElement | null;
      if (iframe?.contentWindow) iframe.contentWindow.postMessage(payload, '*');
    } else if (webviewRef.current) {
      webviewRef.current.postMessage(payload);
    }
  };

  const runSearch = async () => {
    if (search.trim().length < 3) return;
    setLoading(true);
    const r = await forwardGeocode(search.trim());
    setResults(r);
    setLoading(false);
  };

  const pickResult = (r: any) => {
    const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
    setCenter({ lat, lng });
    setResults([]);
    setSearch('');
    flyMapTo(lat, lng);
  };

  const confirmLocation = () => {
    setForm(prev => ({
      ...prev,
      lat: center.lat,
      lng: center.lng,
      line1: reverse.line1 || prev.line1 || '',
      city: reverse.city || prev.city || '',
      pincode: reverse.pincode || prev.pincode || '',
    }));
    setMode('form');
  };

  const saveAddress = () => {
    if (!form.line1 || !form.city) { Alert.alert(t('address_line1') + ' & ' + t('city_label') + ' required'); return; }
    const a: Address = {
      id: editingId || `addr_${Date.now()}`,
      label: (form.label as any) || 'home',
      title: form.title || (form.label === 'work' ? t('label_work') : form.label === 'other' ? t('label_other') : t('label_home')),
      line1: form.line1!,
      line2: form.line2,
      city: form.city!,
      pincode: form.pincode,
      lat: form.lat ?? center.lat,
      lng: form.lng ?? center.lng,
    };
    upsert(a);
    setEditingId(null);
    setMode('list');
  };

  const startAddNew = () => {
    setEditingId(null);
    setForm({ label: 'home', title: t('label_home'), line1: '', city: '', lat: center.lat, lng: center.lng });
    setMode('map');
  };

  const startEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({ ...a });
    setCenter({ lat: a.lat, lng: a.lng });
    setMode('form');
  };

  // -------------- RENDER --------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          testID="addr-back"
          onPress={() => (mode === 'list' ? router.back() : setMode('list'))}
          style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {mode === 'list' ? t('saved_addresses') : mode === 'map' ? t('pick_on_map') : t('save_address')}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {mode === 'list' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Penguin size={88} mood="searching" role="customer" animated />
            <Text style={{ marginTop: 6, color: colors.textMuted, fontSize: 13 }}>{t('select_address')}</Text>
          </View>

          <TouchableOpacity testID="add-new-addr" onPress={startAddNew} style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.brandLight }]}>
              <MapPin size={20} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>{t('pick_on_map')}</Text>
              <Text style={styles.actionSub}>{t('drag_pin_hint')}</Text>
            </View>
            <Plus size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity testID="use-current-loc" onPress={() => { locateCurrent(); setMode('map'); }} style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}>
              <Locate size={20} color={colors.accentDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>{t('use_current_loc')}</Text>
              <Text style={styles.actionSub}>{t('current_location')}</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.section, { marginTop: 22 }]}>{t('saved_addresses')}</Text>
          {addresses.map(a => (
            <View key={a.id} style={[styles.savedCard, active.id === a.id && styles.savedCardActive]}>
              <TouchableOpacity
                testID={`pick-addr-${a.id}`}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                onPress={() => { setActive(a.id); router.back(); }}>
                <View style={[styles.actionIcon, { backgroundColor: a.label === 'home' ? colors.brandLight : a.label === 'work' ? colors.accentLight : colors.berryLight }]}>
                  {a.label === 'home' ? <Home size={18} color={colors.brand} /> : a.label === 'work' ? <Briefcase size={18} color={colors.accentDark} /> : <Bookmark size={18} color={colors.berry} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{a.title}</Text>
                  <Text style={styles.actionSub} numberOfLines={2}>{[a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(', ')}</Text>
                </View>
                {active.id === a.id && <Check size={20} color={colors.brand} />}
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 } as any}>
                <TouchableOpacity testID={`edit-${a.id}`} onPress={() => startEdit(a)} style={[styles.miniBtn]}>
                  <Text style={{ fontSize: 12, color: colors.brand, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
                {addresses.length > 1 && (
                  <TouchableOpacity testID={`delete-${a.id}`} onPress={() => remove(a.id)} style={[styles.miniBtn, { marginLeft: 8 }]}>
                    <Trash2 size={14} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {mode === 'map' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBar}>
            <TextInput
              testID="addr-search"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={runSearch}
              placeholder={t('search_address')}
              placeholderTextColor={colors.textHint}
              style={{ flex: 1, fontSize: 14 }}
            />
            {loading ? <ActivityIndicator color={colors.brand} /> :
              <TouchableOpacity onPress={runSearch}><Text style={{ color: colors.brand, fontWeight: '600' }}>Go</Text></TouchableOpacity>}
          </View>
          {results.length > 0 && (
            <View style={styles.results}>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
                {results.map((r, i) => (
                  <TouchableOpacity key={i} onPress={() => pickResult(r)} style={styles.resultRow}>
                    <MapPin size={14} color={colors.brand} />
                    <Text style={{ marginLeft: 10, flex: 1, fontSize: 13 }} numberOfLines={2}>{r.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ flex: 1, position: 'relative' }}>
            {Platform.OS === 'web' ? (
              // @ts-ignore
              <iframe
                id="yeaamigo-osm-iframe"
                srcDoc={MAP_HTML(center.lat, center.lng)}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="geolocation"
              />
            ) : WebViewMod ? (
              <WebViewMod
                ref={webviewRef}
                source={{ html: MAP_HTML(center.lat, center.lng) }}
                onMessage={handleWebMessage}
                style={{ flex: 1 }}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                geolocationEnabled
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={colors.brand} />
              </View>
            )}
            <TouchableOpacity testID="locate-me" onPress={locateCurrent} style={styles.fab}>
              <Locate size={20} color={colors.brand} />
            </TouchableOpacity>
          </View>

          <View style={styles.confirmBar}>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>{t('drag_pin_hint')}</Text>
            <Text numberOfLines={2} style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '600', marginBottom: 12 }}>
              {[reverse.line1, reverse.city, reverse.pincode].filter(Boolean).join(', ') || `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`}
            </Text>
            <Button testID="confirm-location-btn" title={t('confirm_location')} onPress={confirmLocation} />
          </View>
        </View>
      )}

      {mode === 'form' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 32 }}>
          <Text style={styles.section}>{t('label_as')}</Text>
          <View style={{ flexDirection: 'row', marginVertical: 8 }}>
            {([
              { k: 'home', icon: <Home size={16} color={form.label === 'home' ? '#fff' : colors.brand} />, label: t('label_home') },
              { k: 'work', icon: <Briefcase size={16} color={form.label === 'work' ? '#fff' : colors.brand} />, label: t('label_work') },
              { k: 'other', icon: <Bookmark size={16} color={form.label === 'other' ? '#fff' : colors.brand} />, label: t('label_other') },
            ] as const).map(opt => (
              <TouchableOpacity key={opt.k}
                testID={`label-${opt.k}`}
                onPress={() => setForm(p => ({ ...p, label: opt.k, title: opt.label }))}
                style={[styles.labelChip, form.label === opt.k && { backgroundColor: colors.brand, borderColor: colors.brand }]}>
                {opt.icon}
                <Text style={[styles.labelChipTxt, form.label === opt.k && { color: '#fff' }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormRow label={t('address_line1')} value={form.line1 || ''} onChange={v => setForm(p => ({ ...p, line1: v }))} testID="form-line1" />
          <FormRow label={t('address_line2')} value={form.line2 || ''} onChange={v => setForm(p => ({ ...p, line2: v }))} testID="form-line2" />
          <FormRow label={t('city_label')} value={form.city || ''} onChange={v => setForm(p => ({ ...p, city: v }))} testID="form-city" />
          <FormRow label={t('pincode_label')} value={form.pincode || ''} onChange={v => setForm(p => ({ ...p, pincode: v }))} testID="form-pincode" />

          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={{ marginLeft: 6, color: colors.textMuted, fontSize: 12 }}>
              {(form.lat ?? center.lat).toFixed(4)}, {(form.lng ?? center.lng).toFixed(4)}
            </Text>
            <TouchableOpacity onPress={() => setMode('map')} style={{ marginLeft: 12 }}>
              <Text style={{ color: colors.brand, fontSize: 12, fontWeight: '600' }}>{t('pick_on_map')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button testID="save-address-btn" title={t('save_address')} onPress={saveAddress} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function FormRow({ label, value, onChange, testID }: { label: string; value: string; onChange: (v: string) => void; testID?: string }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>{label}</Text>
      <View style={{ borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, paddingHorizontal: 12, backgroundColor: '#fff', height: 48, justifyContent: 'center' }}>
        <TextInput testID={testID} value={value} onChangeText={onChange} placeholderTextColor={colors.textHint} style={{ fontSize: 14, color: colors.textPrimary }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: colors.borderSubtle, backgroundColor: '#fff' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSurface },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  actionCard: { backgroundColor: '#fff', borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: colors.borderSubtle, marginBottom: 10 },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  actionSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  section: { fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  savedCard: { backgroundColor: '#fff', borderRadius: radius.md, padding: 14, borderWidth: 0.5, borderColor: colors.borderSubtle, marginBottom: 10 },
  savedCardActive: { borderColor: colors.brand, borderWidth: 1.5, backgroundColor: colors.brandLight },
  miniBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.bgSurface },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: space.lg, marginBottom: 0, paddingHorizontal: 14, height: 44, borderRadius: radius.pill, borderWidth: 0.5, borderColor: colors.borderSubtle },
  results: { backgroundColor: '#fff', marginHorizontal: space.lg, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.borderSubtle, marginTop: 6, ...shadow.sm },
  resultRow: { padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderColor: colors.borderSubtle },
  fab: { position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.md },
  confirmBar: { backgroundColor: '#fff', padding: space.lg, borderTopWidth: 0.5, borderColor: colors.borderSubtle, ...shadow.md },
  labelChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderSubtle, marginRight: 8, backgroundColor: '#fff' },
  labelChipTxt: { marginLeft: 6, fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
});
