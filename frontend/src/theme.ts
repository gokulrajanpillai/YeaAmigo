// YeaAmigo design tokens — teal & mustard palette (non-orange, premium, appetizing)
export const colors = {
  // Brand: deep ocean teal — trust + freshness + appetite
  brand: '#0B5D5A',
  brandLight: '#E6F2F0',
  brandSoft: '#C7E2DE',
  brandDark: '#063D3A',

  // Accent: mustard gold — warm, premium, appetite trigger (replaces amber-orange)
  accent: '#E2B43A',
  accentLight: '#FBF1D3',
  accentDark: '#A88017',

  // Berry/plum — for special CTAs
  berry: '#7A2E55',
  berryLight: '#F4E4EC',

  // Status semantics
  success: '#15803D',
  successLight: '#DCFCE7',
  danger: '#B91C1C',
  dangerLight: '#FEE2E2',
  warning: '#B45309',
  warningLight: '#FEF3C7',
  info: '#1E40AF',
  infoLight: '#DBEAFE',

  // Neutral foundation — warm cream background instead of pure white
  textPrimary: '#1B1F2A',
  textMuted: '#5C6675',
  textHint: '#9AA5B4',
  bgWhite: '#FFFFFF',
  bgSurface: '#FAF7F1', // warm cream
  bgElevated: '#FFFFFF',
  borderSubtle: '#E8E3D8',
  borderStrong: '#D5CFC2',
};

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 };
export const shadow = {
  sm: { shadowColor: '#1B1F2A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#1B1F2A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 6 },
};

// Status badge styles
export const STATUS_META: Record<string, { label: string; bg: string; fg: string; line?: boolean }> = {
  pending:   { label: 'PENDING',    bg: colors.warningLight, fg: colors.warning },
  confirmed: { label: 'CONFIRMED',  bg: colors.infoLight,    fg: colors.info },
  preparing: { label: 'PREPARING',  bg: colors.berryLight,   fg: colors.berry },
  ready:     { label: 'READY',      bg: colors.accentLight,  fg: colors.accentDark },
  assigned:  { label: 'ASSIGNED',   bg: colors.brandLight,   fg: colors.brandDark },
  en_route:  { label: 'EN ROUTE',   bg: colors.brandLight,   fg: colors.brandDark },
  delivered: { label: 'DELIVERED',  bg: colors.successLight, fg: colors.success },
  cancelled: { label: 'CANCELLED',  bg: colors.bgSurface,    fg: colors.textMuted, line: true },
};

// Currency formatter (INR)
export const fmtINR = (n: number) => `₹${Math.round((Number(n) || 0) * 100) / 100}`;
