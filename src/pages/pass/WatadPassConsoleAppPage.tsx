import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CopyField from '../../components/pass/CopyField';
import PassPageShell from '../../components/PassPageShell';
import {
  oBtn,
  oBtnSm,
  oInput,
  oLabel,
  PassAlert,
  PassRow,
  PassRowList,
  PassSection,
} from '../../components/pass/pass-ui';
import {
  passApi,
  PassApiError,
  IDENTITY_PUBLIC,
  buildAuthorizeUrl,
  normalizeRedirectUri,
  oauthDemoRedirectUri,
  passApiErrorMessage,
  startOAuthDemo,
  type DevApp,
  type RedirectURI,
} from '../../lib/watad-pass';

type LocationState = {
  notice?: string;
  clientSecret?: string | null;
};

function envBadgeClass(env: string) {
  return env === 'production'
    ? 'border-blue-200 bg-blue-50 text-blue-900'
    : 'border-amber-200 bg-amber-50 text-amber-900';
}

function statusBadgeClass(status: string) {
  return status === 'active'
    ? 'border-green-200 bg-green-50 text-green-900'
    : 'border-red-200 bg-red-50 text-red-900';
}

function MetaRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex flex-nowrap items-center justify-between gap-4 border-b border-line py-4 last:border-b-0">
      <span className="text-base text-muted">{label}</span>
      <strong dir={mono ? 'ltr' : undefined} className={`truncate text-lg font-semibold text-ink ${mono ? 'font-mono text-base' : ''}`}>
        {value}
      </strong>
    </div>
  );
}

export default function WatadPassConsoleAppPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { orgSlug = '', appId = '' } = useParams<{ orgSlug: string; appId: string }>();
  const navState = (location.state as LocationState | null) ?? {};

  const [app, setApp] = useState<DevApp | null>(null);
  const [redirects, setRedirects] = useState<RedirectURI[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(navState.clientSecret ?? null);
  const [notice, setNotice] = useState<string | null>(navState.notice ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newRedirect, setNewRedirect] = useState('');
  const [brandColor, setBrandColor] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const consoleBack = `/pass/console?org=${encodeURIComponent(orgSlug)}`;

  useEffect(() => {
    if (!orgSlug || !appId) return;
    passApi.me().catch((err) => {
      if (err instanceof PassApiError && err.status === 401) {
        navigate(`/pass/login?return_to=${encodeURIComponent(location.pathname)}`, { replace: true });
      }
    });
    passApi.app(orgSlug, appId).then(setApp).catch(() => setApp(null));
    passApi.redirects(orgSlug, appId).then((r) => setRedirects(r.redirect_uris)).catch(() => setRedirects([]));
  }, [orgSlug, appId, navigate, location.pathname]);

  useEffect(() => {
    if (app) {
      setBrandColor(app.brand_color ?? '');
      setLogoUrl(app.logo_url ?? '');
    }
  }, [app]);

  async function toggleStatus() {
    if (!app) return;
    setBusy(true);
    setError(null);
    try {
      const action = app.status === 'active' ? 'disable' : 'enable';
      await passApi.setAppStatus(orgSlug, appId, action);
      setNotice(action === 'disable' ? t('pass.console.appDisabled') : t('pass.console.appEnabled'));
      setApp(await passApi.app(orgSlug, appId));
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function rotateSecret() {
    setBusy(true);
    setError(null);
    try {
      const res = await passApi.rotateSecret(orgSlug, appId);
      setClientSecret(res.client_secret);
      setNotice(t('pass.console.secretRotated'));
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function saveBranding(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await passApi.updateApp(orgSlug, appId, {
        brand_color: brandColor || undefined,
        logo_url: logoUrl || undefined,
      });
      setNotice(t('pass.console.brandingSaved'));
      setApp(await passApi.app(orgSlug, appId));
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function addRedirect(e: FormEvent) {
    e.preventDefault();
    const uri = normalizeRedirectUri(newRedirect);
    if (!uri) return;
    setBusy(true);
    setError(null);
    try {
      await passApi.addRedirect(orgSlug, appId, uri);
      setNewRedirect('');
      setNotice(t('pass.console.redirectAdded'));
      const r = await passApi.redirects(orgSlug, appId);
      setRedirects(r.redirect_uris);
    } catch (err) {
      setError(passApiErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function removeRedirect(id: string) {
    if (!window.confirm(t('pass.console.confirmRemoveRedirect'))) return;
    setBusy(true);
    try {
      await passApi.removeRedirect(orgSlug, appId, id);
      const r = await passApi.redirects(orgSlug, appId);
      setRedirects(r.redirect_uris);
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function trySignIn() {
    if (!app?.client_id) return;
    setBusy(true);
    setError(null);
    try {
      const demoUri = oauthDemoRedirectUri();
      if (!redirects.some((r) => r.uri === demoUri)) {
        await passApi.addRedirect(orgSlug, appId, demoUri);
        const r = await passApi.redirects(orgSlug, appId);
        setRedirects(r.redirect_uris);
      }
      await startOAuthDemo(app.client_id);
    } catch {
      setError(t('pass.errors.generic'));
      setBusy(false);
    }
  }

  const redirectUri = redirects[0]?.uri ?? '';
  const authorizeUrl = app?.client_id && redirectUri
    ? buildAuthorizeUrl(app.client_id, redirectUri)
    : '';

  const snippet = app?.client_id
    ? `// Sign in with WATAD
const WATAD = {
  issuer: "${IDENTITY_PUBLIC}",
  clientId: "${app.client_id}",
  redirectUri: "${redirectUri || 'https://your-app.com/auth/callback'}",
};

// PKCE: generate code_verifier + code_challenge (S256)
// Redirect: \${WATAD.issuer}/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=openid&code_challenge=...&code_challenge_method=S256
// Token: POST \${WATAD.issuer}/oauth/token
// JWKS: \${WATAD.issuer}/.well-known/jwks.json`
    : '';

  if (!app) {
    return (
      <PassPageShell>
        <Link to={consoleBack} className={`${oBtn} mb-10 inline-flex`}>
          <span aria-hidden="true">←</span>
          {t('pass.console.backToApps')}
        </Link>
        <p className="text-lg text-muted">{t('pass.wait')}</p>
      </PassPageShell>
    );
  }

  return (
    <PassPageShell>
      <Link to={consoleBack} className={`${oBtn} mb-10 inline-flex`}>
        <span aria-hidden="true">←</span>
        {t('pass.console.backToApps')}
      </Link>

      {error && <PassAlert role="alert">{error}</PassAlert>}
      {notice && <PassAlert>{notice}</PassAlert>}

      <header className="mb-14 rounded-3xl border border-line bg-white p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-widest text-muted">{t('pass.console.appDetail')}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink lg:text-5xl">{app.name}</h1>
            <p dir="ltr" className="mt-3 font-mono text-lg text-muted">
              {app.slug} {app.client_type}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase ${envBadgeClass(app.environment)}`}>
                {app.environment}
              </span>
              <span className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase ${statusBadgeClass(app.status)}`}>
                {app.status}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              disabled={busy || !app.client_id || app.status !== 'active'}
              onClick={trySignIn}
            >
              {t('pass.oauthDemo.tryButton')}
            </button>
            <button type="button" className={oBtnSm} disabled={busy} onClick={toggleStatus}>
              {app.status === 'active' ? t('pass.console.disableApp') : t('pass.console.enableApp')}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <MetaRow label={t('pass.console.type')} value={app.client_type || ''} />
          <MetaRow label={t('pass.console.environment')} value={app.environment} />
          <MetaRow label={t('pass.console.redirects')} value={redirects.length} />
          <MetaRow label="Client ID" value={app.client_id?.slice(0, 12) || ''} mono />
        </div>
      </header>

      <div className="grid items-start gap-10 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-ink">{t('pass.console.credentials')}</h2>
          <div className="mt-6">
            <CopyField label="Client ID" value={app.client_id ?? ''} />
            <CopyField label="Issuer" value={IDENTITY_PUBLIC} />
            {authorizeUrl && <CopyField label={t('pass.console.authorizeUrl')} value={authorizeUrl} />}
            {clientSecret && (
              <div className="mt-6 rounded-2xl border border-brand/30 bg-soft p-5">
                <CopyField label={t('pass.console.clientSecret')} value={clientSecret} />
                <p className="text-base text-muted">{t('pass.console.secretOnce')}</p>
              </div>
            )}
            {app.client_type === 'confidential' && !clientSecret && (
              <button type="button" className={`${oBtnSm} mt-4`} disabled={busy} onClick={rotateSecret}>
                {t('pass.console.rotateSecret')}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={saveBranding} className="grid content-start gap-5 rounded-2xl border border-line bg-white p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-ink">{t('pass.console.branding')}</h2>
          <label className="block">
            <span className={oLabel}>{t('pass.console.brandColor')}</span>
            <input
              dir="ltr"
              placeholder="#0E9C7B"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className={oInput}
            />
          </label>
          <label className="block">
            <span className={oLabel}>{t('pass.console.logoUrl')}</span>
            <input
              dir="ltr"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className={oInput}
            />
          </label>
          <button type="submit" className={`${oBtnSm} w-fit`} disabled={busy}>
            {t('pass.console.saveBranding')}
          </button>
        </form>
      </div>

      <PassSection title={t('pass.console.redirects')} hint={t('pass.console.redirectsHint')}>
        {redirects.length > 0 ? (
          <PassRowList>
            {redirects.map((r) => (
              <PassRow
                key={r.id}
                main={<code dir="ltr" className="min-w-0 truncate font-mono text-base">{r.uri}</code>}
                action={
                  <button type="button" className={oBtnSm} onClick={() => removeRedirect(r.id)}>
                    {t('pass.remove')}
                  </button>
                }
              />
            ))}
          </PassRowList>
        ) : (
          <p className="mb-6 text-lg text-muted">{t('pass.console.noRedirects')}</p>
        )}
        <form onSubmit={addRedirect} className="grid max-w-2xl gap-5 rounded-2xl border border-line bg-white p-6 lg:p-8">
          <label className="block">
            <span className={oLabel}>{t('pass.console.addRedirect')}</span>
            <input
              required
              dir="ltr"
              placeholder="https://your-app.com/auth/callback"
              value={newRedirect}
              onChange={(e) => setNewRedirect(e.target.value)}
              className={oInput}
            />
            <p className="mt-2 text-sm text-muted">{t('pass.console.redirectFormatHint')}</p>
          </label>
          <button type="submit" className={`${oBtnSm} w-fit`} disabled={busy}>
            {t('pass.console.addRedirectBtn')}
          </button>
        </form>
      </PassSection>

      <PassSection
        title={t('pass.console.integration')}
        action={
          <button type="button" className={oBtnSm} onClick={() => navigator.clipboard.writeText(snippet)}>
            {t('pass.copy.copy')}
          </button>
        }
      >
        <pre className="overflow-x-auto rounded-2xl border border-line bg-soft p-6 font-mono text-sm leading-relaxed text-ink lg:p-8 lg:text-base">
          {snippet}
        </pre>
      </PassSection>
    </PassPageShell>
  );
}
