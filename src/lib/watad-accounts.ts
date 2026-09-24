/** Non-secret account hints for the Google-style account picker (local device only). */

export interface WatadAccountHint {
  email: string;
  display_name?: string;
  avatar_url?: string;
  has_passkey?: boolean;
  last_used: number;
}

const STORAGE_KEY = 'watad_account_hints';
const MAX_HINTS = 5;

export function loadAccountHints(): WatadAccountHint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as WatadAccountHint[];
    return Array.isArray(list)
      ? list
          .filter((h) => h?.email && typeof h.email === 'string')
          .sort((a, b) => b.last_used - a.last_used)
          .slice(0, MAX_HINTS)
      : [];
  } catch {
    return [];
  }
}

export function rememberAccount(hint: Omit<WatadAccountHint, 'last_used'>): void {
  const email = hint.email.trim().toLowerCase();
  if (!email) return;
  const prev = loadAccountHints().find((h) => h.email.toLowerCase() === email);
  const existing = loadAccountHints().filter((h) => h.email.toLowerCase() !== email);
  const next: WatadAccountHint[] = [
    {
      email,
      display_name: hint.display_name?.trim() || undefined,
      avatar_url: hint.avatar_url?.trim() || undefined,
      has_passkey: hint.has_passkey ?? prev?.has_passkey,
      last_used: Date.now(),
    },
    ...existing,
  ].slice(0, MAX_HINTS);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    /* storage blocked */
  }
}

export function hintInitials(hint: WatadAccountHint): string {
  const name = hint.display_name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return hint.email.slice(0, 1).toUpperCase();
}

export function hintLabel(hint: WatadAccountHint): string {
  return hint.display_name?.trim() || hint.email.split('@')[0] || hint.email;
}
