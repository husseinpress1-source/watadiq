import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from 'react';

import { passApi, type PassUser } from '../lib/watad-pass';
import { rememberAccount } from '../lib/watad-accounts';
import { listenForSignInPopup, openWatadSignInPopup } from '../lib/watad-signin-popup';



type SignInView = 'login' | 'profile';



interface WatadAuthContextValue {

  user: PassUser | null;

  loading: boolean;

  signInOpen: boolean;

  signInView: SignInView;

  openSignIn: (view?: SignInView) => void;

  closeSignIn: () => void;

  refreshUser: () => Promise<void>;

  onSignedIn: () => Promise<void>;

  logout: () => Promise<void>;

}



const WatadAuthContext = createContext<WatadAuthContextValue | null>(null);



export function WatadAuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<PassUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [signInOpen, setSignInOpen] = useState(false);

  const [signInView, setSignInView] = useState<SignInView>('login');



  const refreshUser = useCallback(async () => {

    try {

      const res = await passApi.me();
      setUser(res.user);
      rememberAccount({
        email: res.user.email,
        display_name: res.user.display_name,
        avatar_url: res.user.avatar_url,
      });

    } catch {

      setUser(null);

    }

  }, []);



  useEffect(() => {

    refreshUser().finally(() => setLoading(false));

  }, [refreshUser]);



  useEffect(() => listenForSignInPopup(() => { void refreshUser(); }), [refreshUser]);



  const openSignIn = useCallback((view: SignInView = 'login') => {

    if (view === 'profile') {

      setSignInView('profile');

      setSignInOpen(true);

      document.body.style.overflow = 'hidden';

      return;

    }

    openWatadSignInPopup();

  }, []);



  const closeSignIn = useCallback(() => {

    setSignInOpen(false);

    setSignInView('login');

    document.body.style.overflow = '';

  }, []);



  const onSignedIn = useCallback(async () => {

    await refreshUser();

    closeSignIn();

  }, [closeSignIn, refreshUser]);



  const logout = useCallback(async () => {

    await passApi.logout().catch(() => undefined);

    setUser(null);

    closeSignIn();

  }, [closeSignIn]);



  const value = useMemo(

    () => ({

      user,

      loading,

      signInOpen,

      signInView,

      openSignIn,

      closeSignIn,

      refreshUser,

      onSignedIn,

      logout,

    }),

    [user, loading, signInOpen, signInView, openSignIn, closeSignIn, refreshUser, onSignedIn, logout],

  );



  return <WatadAuthContext.Provider value={value}>{children}</WatadAuthContext.Provider>;

}



export function useWatadAuth() {

  const ctx = useContext(WatadAuthContext);

  if (!ctx) throw new Error('useWatadAuth must be used within WatadAuthProvider');

  return ctx;

}



export function userInitials(user: PassUser): string {

  const name = user.display_name?.trim();

  if (name) {

    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();

    return name.slice(0, 2).toUpperCase();

  }

  return (user.email || 'W').slice(0, 1).toUpperCase();

}



export function userLabel(user: PassUser): string {

  return user.display_name?.trim() || user.email.split('@')[0] || user.email;

}


