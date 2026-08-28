/** WATAD Pass identity API — HttpOnly session cookies, never localStorage tokens. */

const BASE = (import.meta.env.VITE_IDENTITY_URL as string | undefined)?.replace(/\/$/, '')
  ?? (import.meta.env.DEV ? '/identity-api' : '');

export const IDENTITY_PUBLIC =
  (import.meta.env.VITE_IDENTITY_URL as string | undefined)?.replace(/\/$/, '')
  ?? (import.meta.env.DEV ? 'http://localhost:8080' : 'https://api.watadiq.com');

export class PassApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

/** Normalize redirect URI input before sending to the API. */
export function normalizeRedirectUri(raw: string): string {
  let uri = raw.trim();
  if (!uri) return uri;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(uri)) {
    uri = `https://${uri.replace(/^\/+/, '')}`;
  }
  return uri;
}

export function passApiErrorMessage(
  err: unknown,
  t: (key: string) => string,
): string {
  if (!(err instanceof PassApiError)) return t('pass.errors.generic');
  switch (err.code) {
    case 'validation_failed':
      return t('pass.errors.redirectInvalid');
    case 'conflict':
      return t('pass.errors.redirectConflict');
    case 'forbidden':
      return t('pass.errors.forbidden');
    case 'rate_limited':
      return t('pass.errors.rate');
    default:
      return t('pass.errors.generic');
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    let code = 'internal_error';
    try {
      const body = await res.json();
      code = body.error ?? code;
    } catch {
      /* non-JSON */
    }
    throw new PassApiError(code, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface PassUser {
  id: string;
  email: string;
  status: string;
  display_name?: string;
  avatar_url?: string;
  locale?: string;
}

export interface Passkey {
  id: string;
  device_label: string;
  backed_up: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface Device {
  id: string;
  label: string;
  platform: string;
  first_seen_at: string;
  last_seen_at: string;
}

export interface LinkedApp {
  id: string;
  app_name: string;
  logo_url: string;
  scopes: string[];
  granted_at: string;
}

export interface Org {
  id: string;
  slug: string;
  name: string;
  plan: string;
  my_role?: string;
}

export interface Member {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  joined_at: string;
}

export interface DevApp {
  id: string;
  name: string;
  slug: string;
  environment: string;
  status: string;
  client_id?: string;
  client_type?: string;
  logo_url?: string;
  brand_color?: string;
  privacy_url?: string;
  tos_url?: string;
}

export interface RedirectURI {
  id: string;
  uri: string;
  created_at?: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: string;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  event_type: string;
  attempt: number;
  response_status: number;
  delivered_at: string;
  next_retry_at: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  actor_type: string;
  actor_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface ConsentPreview {
  name: string;
  logo_url: string;
  brand_color: string;
  environment: string;
}

export type CreateAppBody = {
  name: string;
  slug: string;
  environment: string;
  client_type: string;
};

export const WEBHOOK_EVENTS = [
  'consent.granted',
  'consent.revoked',
  'app.created',
  'app.disabled',
  'app.enabled',
  'app.secret_rotated',
  'member.invited',
  'member.removed',
] as const;

export const MEMBER_ROLES = ['admin', 'developer', 'security_analyst', 'support', 'read_only'] as const;

export function buildAuthorizeUrl(clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: 'CHANGE_ME',
    code_challenge: 'CHANGE_ME',
    code_challenge_method: 'S256',
  });
  return `${IDENTITY_PUBLIC}/oauth/authorize?${params}`;
}

/* ---- Sign in with WATAD demo (PKCE) ---- */

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(len = 48): string {
  return b64url(crypto.getRandomValues(new Uint8Array(len)).buffer);
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return b64url(digest);
}

const OAUTH_STATE_KEY = 'watad_oauth_demo';

/** Official watadiq.com OAuth app — Sign in with WATAD on the company site. */
export const WATAD_SITE_CLIENT_ID =
  (import.meta.env.VITE_WATAD_OAUTH_CLIENT_ID as string | undefined)?.trim()
  || 'wat_lAe6tz8LRI3-c3509EYENRG-AHx803b-';

export function oauthRedirectUri(): string {
  return `${window.location.origin}/pass/oauth/callback`;
}

/** @deprecated use oauthRedirectUri */
export const oauthDemoRedirectUri = oauthRedirectUri;

export async function startOAuth(
  clientId: string,
  returnTo = '/pass/account',
): Promise<void> {
  const verifier = randomString();
  const state = randomString(24);
  const challenge = await pkceChallenge(verifier);
  const redirectUri = oauthRedirectUri();
  sessionStorage.setItem(
    OAUTH_STATE_KEY,
    JSON.stringify({ verifier, state, clientId, redirectUri, returnTo }),
  );
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  window.location.assign(`${IDENTITY_PUBLIC}/oauth/authorize?${params}`);
}

/** Start Sign in with WATAD using the site-registered OAuth client. */
export function startWatadSignIn(returnTo = '/pass/account'): void {
  void startOAuth(WATAD_SITE_CLIENT_ID, returnTo);
}

/** @deprecated use startOAuth */
export async function startOAuthDemo(clientId: string): Promise<void> {
  await startOAuth(clientId, '/pass/account');
}

export function consumeOAuthDemoState():
  | { verifier: string; state: string; clientId: string; redirectUri: string; returnTo?: string }
  | null {
  try {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function exchangeOAuthCode(
  clientId: string,
  code: string,
  verifier: string,
  redirectUri: string,
): Promise<{ access_token: string; id_token?: string; refresh_token?: string; expires_in?: number }> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  });
  const res = await fetch(`${IDENTITY_PUBLIC}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new PassApiError((data as { error?: string }).error ?? 'token_error', res.status);
  return data;
}

export async function fetchUserInfo(accessToken: string): Promise<{ sub: string; email?: string; name?: string }> {
  const res = await fetch(`${IDENTITY_PUBLIC}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new PassApiError('userinfo_error', res.status);
  return res.json();
}

export const passApi = {
  requestCode: (email: string, locale: string) =>
    request('/v1/auth/email/request', {
      method: 'POST',
      body: JSON.stringify({ email, locale }),
    }),

  verifyCode: (email: string, code: string) =>
    request<{ user: PassUser }>('/v1/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  passkeyLoginBegin: (email?: string) =>
    request<{ publicKey?: Record<string, unknown> } & Record<string, unknown>>(
      '/v1/auth/passkey/login/begin',
      { method: 'POST', body: JSON.stringify(email ? { email } : {}) },
    ),

  passkeyLoginFinish: (assertion: unknown) =>
    request<{ user: PassUser }>('/v1/auth/passkey/login/finish', {
      method: 'POST',
      body: JSON.stringify(assertion),
    }),

  logout: () => request('/v1/auth/logout', { method: 'POST' }),

  me: () => request<{ user: PassUser; session_id?: string }>('/v1/me'),

  updateProfile: (body: { display_name?: string; avatar_url?: string }) =>
    request<{ user: PassUser }>('/v1/me', { method: 'PATCH', body: JSON.stringify(body) }),

  passkeys: () => request<{ passkeys: Passkey[] }>('/v1/me/passkeys'),

  passkeyRegisterBegin: () =>
    request<Record<string, unknown>>('/v1/me/passkeys/register/begin', { method: 'POST' }),

  passkeyRegisterFinish: (credential: unknown) =>
    request('/v1/me/passkeys/register/finish', {
      method: 'POST',
      body: JSON.stringify(credential),
    }),

  renamePasskey: (id: string, label: string) =>
    request(`/v1/me/passkeys/${id}`, { method: 'PATCH', body: JSON.stringify({ label }) }),

  revokePasskey: (id: string) => request(`/v1/me/passkeys/${id}`, { method: 'DELETE' }),

  devices: () => request<{ devices: Device[] }>('/v1/me/devices'),

  generateRecoveryCodes: () =>
    request<{ codes: string[]; warning?: string }>('/v1/me/recovery-codes', { method: 'POST' }),

  recoveryCodesRemaining: () => request<{ remaining: number }>('/v1/me/recovery-codes'),

  linkedApps: () => request<{ consents: LinkedApp[] }>('/v1/consents'),

  revokeLinkedApp: (consentId: string) =>
    request(`/v1/consents/${consentId}`, { method: 'DELETE' }),

  consentPreview: (clientId: string) =>
    request<ConsentPreview>(`/v1/consent/preview?client_id=${encodeURIComponent(clientId)}`),

  grantConsent: (clientId: string, scopes: string[]) =>
    request('/v1/consents', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, scopes }),
    }),

  myOrgs: () => request<{ organizations: Org[] }>('/v1/orgs'),

  createOrg: (name: string, slug: string) =>
    request<Org>('/v1/orgs', { method: 'POST', body: JSON.stringify({ name, slug }) }),

  members: (orgSlug: string) =>
    request<{ members: Member[] }>(`/v1/orgs/${orgSlug}/members`),

  inviteMember: (orgSlug: string, email: string, role: string) =>
    request<{ invitation_id: string; invite_token: string; expires_in?: number }>(
      `/v1/orgs/${orgSlug}/invitations`,
      { method: 'POST', body: JSON.stringify({ email, role }) },
    ),

  changeMemberRole: (orgSlug: string, userId: string, role: string) =>
    request(`/v1/orgs/${orgSlug}/members/role`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, role }),
    }),

  removeMember: (orgSlug: string, userId: string) =>
    request(`/v1/orgs/${orgSlug}/members/${userId}`, { method: 'DELETE' }),

  apps: (orgSlug: string) =>
    request<{ applications: DevApp[] }>(`/v1/orgs/${orgSlug}/apps`),

  app: (orgSlug: string, appId: string) =>
    request<DevApp>(`/v1/orgs/${orgSlug}/apps/${appId}`),

  createApp: (orgSlug: string, body: CreateAppBody) =>
    request<{ application: DevApp; client_secret?: string }>(`/v1/orgs/${orgSlug}/apps`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateApp: (orgSlug: string, appId: string, body: Partial<DevApp>) =>
    request(`/v1/orgs/${orgSlug}/apps/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  setAppStatus: (orgSlug: string, appId: string, action: 'enable' | 'disable') =>
    request(`/v1/orgs/${orgSlug}/apps/${appId}/${action}`, { method: 'POST' }),

  rotateSecret: (orgSlug: string, appId: string) =>
    request<{ client_secret: string; rotated_at?: string }>(
      `/v1/orgs/${orgSlug}/apps/${appId}/secret/rotate`,
      { method: 'POST' },
    ),

  redirects: (orgSlug: string, appId: string) =>
    request<{ redirect_uris: RedirectURI[] }>(`/v1/orgs/${orgSlug}/apps/${appId}/redirects`),

  addRedirect: (orgSlug: string, appId: string, uri: string) =>
    request(`/v1/orgs/${orgSlug}/apps/${appId}/redirects`, {
      method: 'POST',
      body: JSON.stringify({ uri }),
    }),

  removeRedirect: (orgSlug: string, appId: string, redirectId: string) =>
    request(`/v1/orgs/${orgSlug}/apps/${appId}/redirects/${redirectId}`, { method: 'DELETE' }),

  audit: (orgSlug: string) =>
    request<{ events: AuditEvent[] }>(`/v1/orgs/${orgSlug}/audit`),

  webhooks: (orgSlug: string) =>
    request<{ webhooks: Webhook[] }>(`/v1/orgs/${orgSlug}/webhooks`),

  createWebhook: (orgSlug: string, url: string, events: string[]) =>
    request<{ id: string; secret: string; url?: string; events?: string[] }>(
      `/v1/orgs/${orgSlug}/webhooks`,
      { method: 'POST', body: JSON.stringify({ url, events }) },
    ),

  deleteWebhook: (orgSlug: string, webhookId: string) =>
    request(`/v1/orgs/${orgSlug}/webhooks/${webhookId}`, { method: 'DELETE' }),

  rotateWebhookSecret: (orgSlug: string, webhookId: string) =>
    request<{ secret: string }>(`/v1/orgs/${orgSlug}/webhooks/${webhookId}/rotate`, {
      method: 'POST',
    }),

  webhookDeliveries: (orgSlug: string, webhookId: string) =>
    request<{ deliveries: WebhookDelivery[] }>(
      `/v1/orgs/${orgSlug}/webhooks/${webhookId}/deliveries`,
    ),
};

export const DEV_CONSOLE_PATH = '/pass/console';

export function consoleAppPath(orgSlug: string, appId: string) {
  return `/pass/console/${encodeURIComponent(orgSlug)}/apps/${encodeURIComponent(appId)}`;
}
