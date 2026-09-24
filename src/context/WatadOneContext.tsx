import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type WatadOneAccount,
  watadOneLogout,
  watadOneMe,
} from '../lib/watadOneApi';

type WatadOneContextValue = {
  account: WatadOneAccount | null;
  loading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const WatadOneContext = createContext<WatadOneContextValue | null>(null);

export function WatadOneProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<WatadOneAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await watadOneMe();
      setAccount(me);
    } catch {
      setAccount(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const logout = useCallback(async () => {
    await watadOneLogout();
    setAccount(null);
  }, []);

  const value = useMemo(
    () => ({
      account,
      loading,
      isAdmin: account?.role === 'admin',
      refresh,
      logout,
    }),
    [account, loading, refresh, logout],
  );

  return <WatadOneContext.Provider value={value}>{children}</WatadOneContext.Provider>;
}

export function useWatadOne() {
  const ctx = useContext(WatadOneContext);
  if (!ctx) throw new Error('useWatadOne must be used within WatadOneProvider');
  return ctx;
}
