import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  const logout = async () => { await setToken(null); setUser(null); };

  return <AuthCtx.Provider value={{ user, loading, login, signup, logout, refresh }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
