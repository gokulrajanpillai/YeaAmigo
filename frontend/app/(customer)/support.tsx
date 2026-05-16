import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPost } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { Button } from '../../src/components/UI';
import { useI18n } from '../../src/i18n';
import { Penguin } from '../../src/components/Mascot';

export default function Support() {
  const { t } = useI18n();
  const CATS = [
    { key: 'missing_item', label: t('cat_missing') },
    { key: 'wrong_order', label: t('cat_wrong') },
    { key: 'late_delivery', label: t('cat_late') },
    { key: 'other', label: t('cat_other') },
  ];
  const [cat, setCat] = useState('other');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (desc.length < 20) { Alert.alert(t('describe_issue'), 'min 20 chars'); return; }
    setLoading(true);
    try {
      const ticket = await apiPost('/support', { category: cat, description: desc });
      Alert.alert('✓', `Ticket ${ticket.id.slice(0, 8)}`);
      setDesc('');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg }}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Penguin size={88} mood="sorry" role="customer" animated />
        </View>
        <Text style={styles.h1}>{t('support_title')}</Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>{t('support_sub')}</Text>

        <Text style={styles.label}>{t('what_wrong')}</Text>
        <View style={styles.grid}>
          {CATS.map(c => (
            <TouchableOpacity key={c.key} testID={`cat-${c.key}`} onPress={() => setCat(c.key)} style={[styles.catBtn, cat === c.key && styles.catBtnActive]}>
              <Text style={[styles.catTxt, cat === c.key && { color: colors.brand, fontWeight: '700' }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('describe_issue')}</Text>
        <View style={styles.input}>
          <TextInput testID="support-desc" value={desc} onChangeText={setDesc}
            placeholderTextColor={colors.textHint}
            multiline numberOfLines={6} style={{ textAlignVertical: 'top', minHeight: 120 }}
          />
        </View>
        <Text style={{ color: colors.textHint, fontSize: 11, marginTop: 4 }}>{desc.length}/500</Text>

        <View style={{ height: 18 }} />
        <Button testID="submit-ticket" title={t('submit_ticket')} onPress={submit} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as any,
  catBtn: { width: '48%', height: 64, marginRight: '2%' as any, marginBottom: 10, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  catBtnActive: { borderColor: colors.brand, backgroundColor: colors.brandLight },
  catTxt: { fontSize: 14, color: colors.textPrimary },
  input: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, padding: 12 },
});
