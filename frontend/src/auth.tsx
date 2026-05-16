import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet, apiPost, setToken, getToken } from './api';

type User = { id: string; email: string; full_name: string; role: string; phone?: string; approved?: boolean };

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = await getToken();
    if (!t) { setUser(null); setLoading(false); return; }
    try {
      const me = await apiGet('/auth/me');
      setUser(me);
    } catch {
      await setToken(null);
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await apiPost('/auth/login', { email, password });
    await setToken(res.token);
    setUser(res.user);
    return res.user as User;
  };

  const signup = async (data: any) => {
    const res = await apiPost('/auth/signup', data);
    await setToken(res.token);
    setUser(res.user);
    return res.user as User;
  };

  const logout = async () => {
    // 1. Wipe token from secure storage FIRST (atomic gate)
    await setToken(null);
    // 2. Clear all user-scoped local data (cart, in-flight)
    try {
      await AsyncStorage.removeItem('yeamigo_cart');
    } catch {}
    // 3. Clear React state — this triggers AuthGuard in root layout to bounce to /(auth)/login
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, signup, logout, refresh }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
