import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import WatadAuthPromoPane from '../components/WatadAuthPromoPane';
import { requestPasswordReset } from '../lib/watadOneApi';
import { useLegacyPlugins } from '../lib/plugins';
import './WatadAccountSignInPage.scss';

export default function WatadAccountForgotPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useLegacyPlugins();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      navigate(`/account/reset?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        replace: true,
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : 'generic';
      setError(t(`auth.recoveryErrors.${code}`, { defaultValue: t('auth.recoveryErrors.generic') }));
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
              <Link to="/account/sign-in" className="watad-auth__mobile-mode">
                {t('auth.signIn')}
              </Link>
            </div>
          </div>

          <Link to="/" className="watad-auth__logo" aria-label={t('common.home')}>
            <img src="/images/watad-logo-red.png" alt="" width={132} height={36} />
          </Link>

          <div className="watad-auth__form-wrap">
            <h1 className="watad-auth__heading">{t('auth.forgotTitle')}</h1>
            <p className="watad-auth__sublead">{t('auth.forgotLead')}</p>

            <form className="watad-auth__form" onSubmit={onSubmit}>
              <label className="watad-auth__field">
                <span>{t('one.email')}</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              {error ? (
                <p className="watad-auth__error" role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" className="watad-auth__submit" disabled={busy}>
                {busy ? t('one.wait') : t('auth.sendCode')}
              </button>
            </form>

            <p className="watad-auth__links">
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

        <WatadAuthPromoPane />
      </div>
    </div>
  );
}
