export const colors = {
  brand: '#FF4F2B',
  brandLight: '#FFF0ED',
  brandDark: '#C93A1A',
  amber: '#FF8C00',
  amberLight: '#FFF4E0',
  success: '#1D9E75',
  successLight: '#E5F4ED',
  danger: '#E24B4A',
  dangerLight: '#FCE9E9',
  blue: '#2563EB',
  blueLight: '#E0E9FE',
  purple: '#7C3AED',
  purpleLight: '#EFE7FE',
  textPrimary: '#1A1A1A',
  textMuted: '#6B6B6B',
  textHint: '#ABABAB',
  bgWhite: '#FFFFFF',
  bgSurface: '#F7F6F3',
  borderSubtle: '#E5E5E0',
};

export const radius = { sm: 6, md: 10, lg: 16, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 };
export const shadow = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 14, elevation: 5 },
};

export const STATUS_META: Record<string, { label: string; bg: string; fg: string; line?: boolean }> = {
  pending:   { label: 'PENDING',    bg: colors.amberLight,  fg: '#A85C00' },
  confirmed: { label: 'CONFIRMED',  bg: colors.blueLight,   fg: '#1E3FAE' },
  preparing: { label: 'PREPARING',  bg: colors.purpleLight, fg: '#5B1FB8' },
  ready:     { label: 'READY',      bg: colors.successLight,fg: '#0F6A4F' },
  assigned:  { label: 'ASSIGNED',   bg: colors.brandLight,  fg: colors.brandDark },
  en_route:  { label: 'EN ROUTE',   bg: colors.brandLight,  fg: colors.brandDark },
  delivered: { label: 'DELIVERED',  bg: colors.successLight,fg: '#0F6A4F' },
  cancelled: { label: 'CANCELLED',  bg: colors.bgSurface,   fg: colors.textMuted, line: true },
};
