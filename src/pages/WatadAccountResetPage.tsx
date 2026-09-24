import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import WatadAuthPromoPane from '../components/WatadAuthPromoPane';
import { resetPasswordWithCode } from '../lib/watadOneApi';
import { useLegacyPlugins } from '../lib/plugins';
import './WatadAccountSignInPage.scss';

export default function WatadAccountResetPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email')?.trim().toLowerCase() || '';

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  useLegacyPlugins();

  if (!email) {
    return <Navigate to="/account/forgot" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('auth.recoveryErrors.password-mismatch'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetPasswordWithCode(email, code, password);
      setDone(true);
      setTimeout(() => navigate('/account/sign-in', { replace: true }), 1800);
    } catch (err) {
      const c = err instanceof Error ? err.message : 'generic';
      setError(t(`auth.recoveryErrors.${c}`, { defaultValue: t('auth.recoveryErrors.generic') }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="watad-auth">
      <div className="watad-auth__split">
        <section className="watad-auth__form-pane">
          <div className="watad-auth__mobile-top">
            <Link to="/" className="watad-auth__mobile-logo" aria-label={t('common.home')}>
              <img src="/images/watad-logo-red.png" alt="" width={112} height={30} />
            </Link>
            <div className="watad-auth__mobile-actions">
              <LanguageSwitcher variant="header" />
              <Link to="/account/forgot" className="watad-auth__mobile-mode">
                {t('auth.resendCode')}
              </Link>
            </div>
          </div>

          <Link to="/" className="watad-auth__logo" aria-label={t('common.home')}>
            <img src="/images/watad-logo-red.png" alt="" width={132} height={36} />
          </Link>

          <div className="watad-auth__form-wrap">
            <h1 className="watad-auth__heading">{t('auth.resetTitle')}</h1>
            <p className="watad-auth__sublead">{t('auth.resetLead')}</p>
            <p className="watad-auth__account-email">{email}</p>

            {done ? (
              <p className="watad-auth__status" role="status">
                {t('auth.resetSuccess')}
              </p>
            ) : (
              <form className="watad-auth__form" onSubmit={onSubmit}>
                <label className="watad-auth__field watad-auth__field--code">
                  <span>{t('auth.codeLabel')}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                  />
                </label>

                <label className="watad-auth__field">
                  <span>{t('auth.newPassword')}</span>
                  <span className="watad-auth__password">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
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

                <label className="watad-auth__field">
                  <span>{t('auth.confirmPassword')}</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>

                {error ? (
                  <p className="watad-auth__error" role="alert">
                    {error}
                  </p>
                ) : null}

                <button type="submit" className="watad-auth__submit" disabled={busy || code.length !== 6}>
                  {busy ? t('one.wait') : t('auth.resetButton')}
                </button>
              </form>
            )}

            <p className="watad-auth__links watad-auth__links--muted">
              <Link to="/account/sign-in">{t('auth.backSignIn')}</Link>
            </p>

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

        <WatadAuthPromoPane topLink={{ to: '/account/forgot', label: t('auth.resendCode') }} />
      </div>
    </div>
  );
}
