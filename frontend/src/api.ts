import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = (process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/\/$/, '') + '/api';

export async function getToken() {
  return AsyncStorage.getItem('yeamigo_token');
}
export async function setToken(t: string | null) {
  if (t) await AsyncStorage.setItem('yeamigo_token', t);
  else await AsyncStorage.removeItem('yeamigo_token');
}

export async function api(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = data?.detail || data?.message || `Request failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export const apiGet = (p: string) => api(p);
export const apiPost = (p: string, body: any) => api(p, { method: 'POST', body: JSON.stringify(body) });
export const apiPatch = (p: string, body: any) => api(p, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = (p: string) => api(p, { method: 'DELETE' });

// ---- Cart helpers (per-restaurant local cart) ----
export type CartItem = { item_id: string; name: string; price_gbp: number; quantity: number; image_url?: string };
export type Cart = { restaurant_id: string; restaurant_name: string; items: CartItem[] };

export async function loadCart(): Promise<Cart | null> {
  const raw = await AsyncStorage.getItem('yeamigo_cart');
  return raw ? JSON.parse(raw) : null;
}
export async function saveCart(c: Cart | null) {
  if (!c) await AsyncStorage.removeItem('yeamigo_cart');
  else await AsyncStorage.setItem('yeamigo_cart', JSON.stringify(c));
}
