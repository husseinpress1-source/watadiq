import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { useWatadOne } from '../context/WatadOneContext';
import { watadOneLogin, watadOneRegister } from '../lib/watadOneApi';
import { useLegacyPlugins } from '../lib/plugins';
import './WatadAccountSignInPage.scss';

type Mode = 'login' | 'register';

const REMEMBER_KEY = 'watad_auth_email';

export default function WatadAccountSignInPage() {
  const { t } = useTranslation();
  const { account, refresh } = useWatadOne();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'register' ? 'register' : 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useLegacyPlugins();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) setEmail(saved);
    } catch {
      /* ignore */
    }
  }, []);

  if (account) {
    const returnTo =
      params.get('return') || (account.role === 'admin' ? '/admin/blog' : '/');
    return <Navigate to={returnTo} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') {
        await watadOneRegister(fullName.trim(), email.trim(), password);
      } else {
        await watadOneLogin(email.trim(), password);
      }
      if (remember) {
        try {
          localStorage.setItem(REMEMBER_KEY, email.trim());
        } catch {
          /* ignore */
        }
      }
      await refresh();
    } catch (err) {
      const code = err instanceof Error ? err.message : 'generic';
      setError(t(`one.errors.${code}`, { defaultValue: t('one.errors.generic') }));
    } finally {
      setBusy(false);
    }
  }

  const heading =
    mode === 'login' ? t('auth.signInTo') : t('auth.createAccountTitle');

  return (
    <div className="watad-auth">
      <div className="watad-auth__split">
        <section className="watad-auth__form-pane">
          <div className="watad-auth__mobile-top">
            <Link to="/" className="watad-auth__mobile-logo" aria-label={t('common.home')}>
              <img src="/images/watad-logo-red.png" alt="" width={112} height={30} />
            </Link>
            <LanguageSwitcher variant="header" />
          </div>

          <Link to="/" className="watad-auth__logo" aria-label={t('common.home')}>
            <img src="/images/watad-logo-red.png" alt="" width={132} height={36} />
          </Link>

          <div className="watad-auth__form-wrap">
            <h1 className="watad-auth__heading">{heading}</h1>

            <div className="watad-auth__tabs" role="tablist" aria-label={t('auth.modeTabsAria')}>
              <button
                type="button"
                role="tab"
                id="watad-auth-tab-login"
                aria-selected={mode === 'login'}
                aria-controls="watad-auth-panel"
                className={mode === 'login' ? 'is-active' : ''}
                onClick={() => setMode('login')}
              >
                {t('auth.signIn')}
              </button>
              <button
                type="button"
                role="tab"
                id="watad-auth-tab-register"
                aria-selected={mode === 'register'}
                aria-controls="watad-auth-panel"
                className={mode === 'register' ? 'is-active' : ''}
                onClick={() => setMode('register')}
              >
                {t('auth.signUp')}
              </button>
            </div>

            <form
              id="watad-auth-panel"
              role="tabpanel"
              aria-labelledby={mode === 'login' ? 'watad-auth-tab-login' : 'watad-auth-tab-register'}
              className="watad-auth__form"
              onSubmit={onSubmit}
            >
              {mode === 'register' ? (
                <label className="watad-auth__field">
                  <span>{t('one.fullName')}</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                  />
                </label>
              ) : null}

              <label className="watad-auth__field">
                <span>{t('one.email')}</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="watad-auth__field">
                <span>{t('one.password')}</span>
                <span className="watad-auth__password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="watad-auth__eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </span>
              </label>

              {mode === 'login' ? (
                <label className="watad-auth__remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>{t('auth.remember')}</span>
                </label>
              ) : (
                <p className="watad-auth__hint">{t('one.passwordHint')}</p>
              )}

              {error ? (
                <p className="watad-auth__error" role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" className="watad-auth__submit" disabled={busy}>
                {busy
                  ? t('one.wait')
                  : mode === 'login'
                    ? t('auth.signIn')
                    : t('auth.createAccount')}
              </button>
            </form>

            {mode === 'login' ? (
              <p className="watad-auth__links watad-auth__links--muted">
                <Link to="/account/forgot">{t('auth.forgot')}</Link>
              </p>
            ) : null}

            <p className="watad-auth__legal">
              {t('auth.legalPrefix')}{' '}
              <Link to="/terms">{t('legalCommon.navTerms')}</Link> ·{' '}
              <Link to="/privacy">{t('legalCommon.navPrivacy')}</Link>
            </p>
          </div>

          <Link to="/" className="watad-auth__back-home">
            ← {t('common.home')}
          </Link>
        </section>

        <aside className="watad-auth__promo-pane" aria-label={t('auth.promoAria')}>
          <div className="watad-auth__promo-bg" aria-hidden="true">
            <img src="/images/auth/sign-in-hero-1280.webp" alt="" decoding="async" />
          </div>
          <div className="watad-auth__promo-scrim" aria-hidden="true" />

          <div className="watad-auth__promo-top">
            <LanguageSwitcher variant="auth" />
          </div>
        </aside>
      </div>
    </div>
  );
}
