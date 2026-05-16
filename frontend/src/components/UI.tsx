import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, space, STATUS_META } from '../theme';

export function Button({
  title, onPress, variant = 'primary', disabled, loading, testID, style,
}: {
  title: string; onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean; loading?: boolean; testID?: string; style?: ViewStyle;
}) {
  const bg =
    variant === 'primary' ? colors.brand
    : variant === 'danger' ? colors.danger
    : variant === 'secondary' ? 'transparent'
    : 'transparent';
  const fg = variant === 'ghost' || variant === 'secondary' ? colors.brand : '#fff';
  const border = variant === 'secondary' ? colors.brand : 'transparent';
  return (
    <TouchableOpacity
      testID={testID} disabled={disabled || loading} activeOpacity={0.85}
      onPress={onPress}
      style={[{
        backgroundColor: bg, borderRadius: radius.md, height: 48,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg,
        borderWidth: variant === 'secondary' ? 1 : 0, borderColor: border,
        opacity: disabled ? 0.5 : 1,
      }, style]}>
      {loading
        ? <ActivityIndicator color={fg} />
        : <Text style={{ color: fg, fontWeight: '600', fontSize: 15 }}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function StatusBadge({ status, testID }: { status: string; testID?: string }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <View testID={testID} style={{
      backgroundColor: m.bg, paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: radius.pill, alignSelf: 'flex-start',
    }}>
      <Text style={{
        color: m.fg, fontSize: 11, fontWeight: '700',
        letterSpacing: 0.6,
        textDecorationLine: m.line ? 'line-through' : 'none',
      }}>{m.label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{
      backgroundColor: colors.bgWhite, borderRadius: radius.lg, padding: space.lg,
      borderWidth: 0.5, borderColor: colors.borderSubtle,
    }, style]}>{children}</View>
  );
}

export function Skeleton({ height = 14, width = '100%' as any, style }: { height?: number; width?: any; style?: ViewStyle }) {
  return <View style={[{ backgroundColor: colors.borderSubtle, height, width, borderRadius: radius.sm, opacity: 0.6 }, style]} />;
}

export function EmptyState({
  icon, title, subtitle, action, testID,
}: { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode; testID?: string }) {
  return (
    <View testID={testID} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.huge }}>
      <View style={{ marginBottom: space.lg, opacity: 0.5 }}>{icon}</View>
      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 }}>{title}</Text>
      {subtitle ? <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: space.lg }}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

export function Chip({ label, active, onPress, testID }: { label: string; active?: boolean; onPress?: () => void; testID?: string }) {
  return (
    <TouchableOpacity testID={testID} onPress={onPress} style={{
      paddingHorizontal: 14, height: 36, borderRadius: radius.pill,
      backgroundColor: active ? colors.brand : colors.bgWhite,
      borderWidth: 1, borderColor: active ? colors.brand : colors.borderSubtle,
      alignItems: 'center', justifyContent: 'center', marginRight: 8,
    }}>
      <Text style={{ color: active ? '#fff' : colors.textPrimary, fontWeight: '500', fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Input(props: any) {
  return (
    <View>
      {props.label ? <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>{props.label}</Text> : null}
      <View style={{
        height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderSubtle,
        paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#fff',
      }}>
        {React.createElement(require('react-native').TextInput, {
          ...props,
          placeholderTextColor: colors.textHint,
          style: [{ fontSize: 15, color: colors.textPrimary }, props.style],
        })}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({});
