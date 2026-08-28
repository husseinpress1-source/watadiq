export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = 'watad_cookie_consent_v1';

export function defaultPreferences(): CookiePreferences {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date().toISOString(),
  };
}

export function getStoredConsent(): CookiePreferences | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePreferences;
    if (parsed.necessary !== true) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(preferences: Omit<CookiePreferences, 'updatedAt'>): CookiePreferences {
  const stored: CookiePreferences = {
    ...preferences,
    necessary: true,
    updatedAt: new Date().toISOString(),
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent('watad:cookie-consent', { detail: stored }));
    }
  } catch {
    /* private browsing or storage blocked */
  }
  return stored;
}

export function hasConsentChoice(): boolean {
  return getStoredConsent() !== null;
}
