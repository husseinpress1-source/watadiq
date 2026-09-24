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
  defaultPreferences,
  getStoredConsent,
  hasConsentChoice,
  saveConsent,
  type CookiePreferences,
} from '../lib/cookie-consent';

type CookieConsentContextValue = {
  visible: boolean;
  settingsOpen: boolean;
  preferences: CookiePreferences;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (prefs: Pick<CookiePreferences, 'analytics' | 'marketing'>) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readInitialPreferences(): CookiePreferences {
  return getStoredConsent() ?? defaultPreferences();
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readInitialPreferences);
  const [hasChoice, setHasChoice] = useState(() => hasConsentChoice());
  const [paintReady, setPaintReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.position = '';

    const unlockBody = () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) unlockBody();
    };

    window.addEventListener('pageshow', onPageShow);
    const onOpenSettings = () => {
      const stored = getStoredConsent();
      if (stored) setPreferences(stored);
      setSettingsOpen(true);
    };
    window.addEventListener('watad:open-cookie-settings', onOpenSettings);

    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setPaintReady(true);
    };

    if (document.readyState === 'complete') {
      requestAnimationFrame(() => requestAnimationFrame(reveal));
    } else {
      window.addEventListener('load', () => {
        requestAnimationFrame(() => requestAnimationFrame(reveal));
      }, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('watad:open-cookie-settings', onOpenSettings);
    };
  }, []);

  const persist = useCallback((next: Pick<CookiePreferences, 'analytics' | 'marketing'>) => {
    const stored = saveConsent({ necessary: true, ...next });
    setPreferences(stored);
    setHasChoice(true);
    setSettingsOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist({ analytics: true, marketing: true });
  }, [persist]);

  const rejectOptional = useCallback(() => {
    persist({ analytics: false, marketing: false });
  }, [persist]);

  const savePreferences = useCallback((prefs: Pick<CookiePreferences, 'analytics' | 'marketing'>) => {
    persist(prefs);
  }, [persist]);

  const openSettings = useCallback(() => {
    const stored = getStoredConsent();
    if (stored) setPreferences(stored);
    setSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const visible = paintReady && (settingsOpen || !hasChoice);

  const value = useMemo(
    () => ({
      visible,
      settingsOpen,
      preferences,
      openSettings,
      closeSettings,
      acceptAll,
      rejectOptional,
      savePreferences,
    }),
    [visible, settingsOpen, preferences, openSettings, closeSettings, acceptAll, rejectOptional, savePreferences],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return ctx;
}
