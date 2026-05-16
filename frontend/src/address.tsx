// YeaAmigo address context — persists the user's selected delivery address.
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Address = {
  id: string;
  label: 'home' | 'work' | 'other';
  title: string;        // E.g. "Home", "Work", "Mom's place"
  line1: string;        // Street/area
  line2?: string;       // Apartment/landmark/instructions
  city: string;
  pincode?: string;
  lat: number;
  lng: number;
};

const STORAGE_KEY = 'yeamigo_addresses_v2';
const ACTIVE_KEY = 'yeamigo_active_addr_v2';

const DEFAULT: Address = {
  id: 'default',
  label: 'home',
  title: 'Home',
  line1: 'MG Road',
  line2: 'Near Trinity Metro',
  city: 'Bengaluru',
  pincode: '560001',
  lat: 12.9756,
  lng: 77.6066,
};

type Ctx = {
  addresses: Address[];
  active: Address;
  setActive: (id: string) => void;
  upsert: (a: Address) => void;
  remove: (id: string) => void;
  clear: () => Promise<void>;
};

const AddrCtx = createContext<Ctx>({} as any);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([DEFAULT]);
  const [activeId, setActiveId] = useState<string>('default');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const list: Address[] = raw ? JSON.parse(raw) : [DEFAULT];
        setAddresses(list.length ? list : [DEFAULT]);
        const aid = await AsyncStorage.getItem(ACTIVE_KEY);
        if (aid && list.find(a => a.id === aid)) setActiveId(aid);
        else setActiveId((list[0] || DEFAULT).id);
      } catch {
        setAddresses([DEFAULT]);
      }
    })();
  }, []);

  const persist = useCallback(async (list: Address[], aid?: string) => {
    setAddresses(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
    if (aid !== undefined) {
      setActiveId(aid);
      await AsyncStorage.setItem(ACTIVE_KEY, aid).catch(() => {});
    }
  }, []);

  const setActive = useCallback((id: string) => {
    setActiveId(id);
    AsyncStorage.setItem(ACTIVE_KEY, id).catch(() => {});
  }, []);

  const upsert = useCallback((a: Address) => {
    setAddresses(prev => {
      const idx = prev.findIndex(p => p.id === a.id);
      const list = idx >= 0 ? prev.map(p => (p.id === a.id ? a : p)) : [...prev, a];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
      AsyncStorage.setItem(ACTIVE_KEY, a.id).catch(() => {});
      setActiveId(a.id);
      return list;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setAddresses(prev => {
      const list = prev.filter(p => p.id !== id);
      const next = list.length ? list : [DEFAULT];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      if (activeId === id) {
        const nid = next[0].id;
        setActiveId(nid);
        AsyncStorage.setItem(ACTIVE_KEY, nid).catch(() => {});
      }
      return next;
    });
  }, [activeId]);

  const clear = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    await AsyncStorage.removeItem(ACTIVE_KEY).catch(() => {});
    setAddresses([DEFAULT]);
    setActiveId('default');
  }, []);

  const active = addresses.find(a => a.id === activeId) || addresses[0] || DEFAULT;

  return (
    <AddrCtx.Provider value={{ addresses, active, setActive, upsert, remove, clear }}>
      {children}
    </AddrCtx.Provider>
  );
}

export const useAddress = () => useContext(AddrCtx);

export function formatAddress(a: Address): string {
  const parts = [a.line1, a.line2, a.city, a.pincode].filter(Boolean);
  return parts.join(', ');
}

export function shortAddress(a: Address): string {
  return [a.line1, a.city].filter(Boolean).join(', ');
}
