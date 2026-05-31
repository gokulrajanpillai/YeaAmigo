import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Switch, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { apiGet, apiPatch, apiPost } from '../../src/api';
import { colors, radius, space } from '../../src/theme';
import { Button } from '../../src/components/UI';

export default function MenuBuilder() {
  const [menu, setMenu] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'Mains', price_gbp: '199', image_url: '', is_available: true });

  const load = useCallback(async () => {
    try {
      const r = await apiGet('/restaurants/owner/mine');
      const m = await apiGet(`/restaurants/${r.id}/menu`);
      setMenu(m);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleItem = async (item: any) => {
    await apiPatch(`/menu/items/${item.id}`, { ...item, is_available: !item.is_available });
    load();
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', category: 'Mains', price_gbp: '199', image_url: '', is_available: true });
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'Mains',
      price_gbp: String(item.price_gbp || ''),
      image_url: item.image_url || '',
      is_available: !!item.is_available,
    });
  };

  const closeForm = () => setEditing(undefined);

  const save = async () => {
    const price = Number(form.price_gbp);
    if (!form.name.trim() || !form.category.trim() || Number.isNaN(price) || price <= 0) {
      Alert.alert('Check dish details', 'Dish name, category and a valid price are required.');
      return;
    }
    const payload = { ...form, name: form.name.trim(), category: form.category.trim(), price_gbp: price };
    setSaving(true);
    try {
      if (editing) await apiPatch(`/menu/items/${editing.id}`, payload);
      else await apiPost('/menu/items', payload);
      closeForm();
      load();
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const formVisible = editing !== undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ padding: space.lg, borderBottomWidth: 0.5, borderColor: colors.borderSubtle }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700' }}>Menu Builder</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>Create dishes, edit prices and toggle availability</Text>
          </View>
          <TouchableOpacity testID="add-menu-item" onPress={openNew} style={styles.addBtn}>
            <Plus size={18} color="#fff" />
          </TouchableOpacity>
        </View>
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
                <TouchableOpacity testID={`edit-${it.id}`} onPress={() => openEdit(it)} style={styles.editBtn}>
                  <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 12 }}>Edit</Text>
                </TouchableOpacity>
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

      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={closeForm}>
        <View style={styles.sheetBg}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{editing ? 'Update dish' : 'Create dish'}</Text>
            <Field label="Dish name" value={form.name} onChangeText={(name: string) => setForm(f => ({ ...f, name }))} testID="dish-name" />
            <Field label="Description" value={form.description} onChangeText={(description: string) => setForm(f => ({ ...f, description }))} testID="dish-description" />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field label="Category" value={form.category} onChangeText={(category: string) => setForm(f => ({ ...f, category }))} testID="dish-category" />
              </View>
              <View style={{ width: 120 }}>
                <Field label="Price" value={form.price_gbp} onChangeText={(price_gbp: string) => setForm(f => ({ ...f, price_gbp }))} keyboardType="decimal-pad" testID="dish-price" />
              </View>
            </View>
            <Field label="Image URL" value={form.image_url} onChangeText={(image_url: string) => setForm(f => ({ ...f, image_url }))} testID="dish-image" />
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <Button title="Cancel" variant="secondary" onPress={closeForm} style={{ flex: 1, marginRight: 8 }} />
              <Button title={editing ? 'Save changes' : 'Create dish'} onPress={save} loading={saving} testID="save-menu-item" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textHint}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: colors.borderSubtle },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.bgSurface },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  editBtn: { height: 34, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: space.lg, paddingBottom: 28 },
  sheetTitle: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  input: { minHeight: 46, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, paddingHorizontal: 12, color: colors.textPrimary, backgroundColor: '#fff' },
});
