import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PassPageShell from '../../components/PassPageShell';
import { passApi, PassApiError, type ConsentPreview } from '../../lib/watad-pass';

import '../AccountPages.scss';
import './WatadPassPages.scss';

const KNOWN_SCOPES = ['openid', 'profile', 'email', 'offline_access'] as const;

const SCOPE_ICON_SRC: Record<string, string> = {
  openid: '/assets/icons/consent/scope-openid-128.png',
  profile: '/assets/icons/consent/scope-profile-128.png',
  email: '/assets/icons/consent/scope-email-128.png',
  offline_access: '/assets/icons/consent/scope-offline-128.png',
};

const SCOPE_ICON_SRCSET: Record<string, string> = {
  openid: '/assets/icons/consent/scope-openid-128.png 1x, /assets/icons/consent/scope-openid-256.png 2x',
  profile: '/assets/icons/consent/scope-profile-128.png 1x, /assets/icons/consent/scope-profile-256.png 2x',
  email: '/assets/icons/consent/scope-email-128.png 1x, /assets/icons/consent/scope-email-256.png 2x',
  offline_access: '/assets/icons/consent/scope-offline-128.png 1x, /assets/icons/consent/scope-offline-256.png 2x',
};

const WATAD_LOGO = '/images/watad-logo-red.png';

function ConsentScopeIcon({ scope }: { scope: string }) {
  const key = scope in SCOPE_ICON_SRC ? scope : 'default';
  const src = SCOPE_ICON_SRC[key] ?? '/assets/icons/consent/scope-default-128.png';
  const srcSet = SCOPE_ICON_SRCSET[key] ?? '/assets/icons/consent/scope-default-128.png 1x, /assets/icons/consent/scope-default-256.png 2x';
  return (
    <img
      src={src}
      srcSet={srcSet}
      alt=""
      className="pass-consent__scope-icon-img"
      width={40}
      height={40}
      decoding="async"
    />
  );
}

export default function WatadPassConsentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const clientId = params.get('client_id') ?? '';
  const scopes = (params.get('scopes') ?? 'openid').split(' ').filter(Boolean);
  const returnTo = params.get('return_to') ?? '';

  const [app, setApp] = useState<ConsentPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId || !returnTo) {
      setError(t('pass.consent.invalid'));
      return;
    }

    passApi
      .consentPreview(clientId)
      .then(setApp)
      .catch((err) => {
        if (err instanceof PassApiError && err.status === 401) {
          navigate(`/pass/login?return_to=${encodeURIComponent(window.location.href)}`, { replace: true });
        } else {
          setError(t('pass.consent.invalid'));
        }
      });
  }, [clientId, returnTo, navigate, t]);

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await passApi.grantConsent(clientId, scopes);
      window.location.href = returnTo;
    } catch {
      setError(t('pass.errors.generic'));
      setBusy(false);
    }
  }

  function deny() {
    window.location.href = returnTo;
  }

  return (
    <PassPageShell hideSubnav>
      <div className="pass-consent-page">
        <div className="pass-consent-window" role="dialog" aria-labelledby="pass-consent-title">
          <header className="pass-consent-window__chrome">
            <img
              src="/assets/icons/consent/window-shield-128.png"
              srcSet="/assets/icons/consent/window-shield-128.png 1x, /assets/icons/consent/window-shield-256.png 2x"
              alt=""
              className="pass-consent-window__chrome-icon"
              width={22}
              height={22}
              decoding="async"
            />
            <span className="pass-consent-window__chrome-brand">{t('pass.consent.brand')}</span>
          </header>

          <div className="pass-consent-window__body">
            <h1 id="pass-consent-title" className="pass-consent-window__title">
              {t('pass.consent.pageTitle')}
            </h1>

            {error ? (
              <div className="pass-consent-window__panel pass-consent-window__panel--error">
                <p className="account-form__error" role="alert">{error}</p>
              </div>
            ) : app === null ? (
              <div className="pass-consent-window__panel">
                <p className="pass-consent-window__loading">{t('pass.wait')}</p>
              </div>
            ) : (
              <>
                <div className="pass-consent__bridge">
                  <div className="pass-consent__party pass-consent__party--app">
                    {app.logo_url ? (
                      <img src={app.logo_url} alt="" className="pass-consent__logo" />
                    ) : (
                      <div
                        className="pass-consent__logo pass-consent__logo--fallback"
                        style={{ backgroundColor: app.brand_color || '#0E9C7B' }}
                      >
                        {app.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="pass-consent__party-meta">
                      <span className="pass-consent__party-label">{t('pass.consent.appLabel')}</span>
                      <strong>{app.name}</strong>
                      {app.environment === 'development' && (
                        <span className="pass-consent__badge">{t('pass.consent.devBadge')}</span>
                      )}
                    </div>
                  </div>

                  <div className="pass-consent__connector" aria-hidden="true">
                    <img
                      src="/assets/icons/consent/link-connector-128.png"
                      srcSet="/assets/icons/consent/link-connector-128.png 1x, /assets/icons/consent/link-connector-256.png 2x"
                      alt=""
                      className="pass-consent__connector-icon"
                      width={40}
                      height={40}
                      decoding="async"
                    />
                  </div>

                  <div className="pass-consent__party pass-consent__party--watad">
                    <img
                      src={WATAD_LOGO}
                      alt=""
                      className="pass-consent__logo pass-consent__logo--watad"
                      width={52}
                      height={52}
                      decoding="async"
                    />
                    <div className="pass-consent__party-meta">
                      <span className="pass-consent__party-label">{t('pass.consent.watadLabel')}</span>
                      <strong>WATAD ONE</strong>
                    </div>
                  </div>
                </div>

                <p className="pass-consent__subtitle">
                  {t('pass.consent.subtitle', { app: app.name })}
                </p>

                <div className="pass-consent__scopes-head">
                  <h2>{t('pass.consent.requests')}</h2>
                </div>

                <ul className="pass-consent__scopes">
                  {scopes.map((scope) =>
                    (KNOWN_SCOPES as readonly string[]).includes(scope) ? (
                      <li key={scope}>
                        <ConsentScopeIcon scope={scope} />
                        <div>
                          <strong>{t(`pass.consent.scope.${scope}.title`)}</strong>
                          <p>{t(`pass.consent.scope.${scope}.desc`)}</p>
                        </div>
                      </li>
                    ) : (
                      <li key={scope}>
                        <ConsentScopeIcon scope="default" />
                        <div><strong dir="ltr">{scope}</strong></div>
                      </li>
                    ),
                  )}
                </ul>

                <p className="pass-consent__hint">{t('pass.consent.allowHint')}</p>

                <div className="pass-consent__actions">
                  <button
                    type="button"
                    className="pass-btn pass-btn--outline pass-btn--outline-primary pass-btn--block pass-btn--lg pass-consent__allow"
                    disabled={busy}
                    onClick={approve}
                  >
                    {busy ? t('pass.wait') : t('pass.consent.allow')}
                  </button>
                  <button
                    type="button"
                    className="pass-btn pass-btn--outline pass-btn--block pass-btn--lg pass-consent__deny"
                    disabled={busy}
                    onClick={deny}
                  >
                    {t('pass.consent.deny')}
                  </button>
                </div>

                <p className="pass-consent__revoke-hint">{t('pass.consent.denyHint')}</p>
              </>
            )}
          </div>

          <footer className="pass-consent-window__footer">
            <Link to="/pass/account">{t('pass.consent.accountLink')}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/pass/developers/guide">{t('pass.consent.devDocsLink')}</Link>
          </footer>
        </div>
      </div>
    </PassPageShell>
  );
}
