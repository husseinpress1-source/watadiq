import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { passApi, PassApiError } from '../../lib/watad-pass';
import { getAssertion, webauthnSupported } from '../../lib/webauthn';
import {
  hintInitials,
  hintLabel,
  loadAccountHints,
  rememberAccount,
  type WatadAccountHint,
} from '../../lib/watad-accounts';
import { finishSignInPopup, isSignInPopup } from '../../lib/watad-signin-popup';
import './WatadPassSignInPopupPage.scss';

type Stage = 'choose' | 'email' | 'code';

export default function WatadPassSignInPopupPage() {
  const { t, i18n } = useTranslation();
  const popup = isSignInPopup();

  const [hints, setHints] = useState<WatadAccountHint[]>([]);
  const [stage, setStage] = useState<Stage>('choose');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passkeyReady, setPasskeyReady] = useState(false);

  useEffect(() => setPasskeyReady(webauthnSupported()), []);
  useEffect(() => {
    const saved = loadAccountHints();
    setHints(saved);
    setStage(saved.length ? 'choose' : 'email');
  }, []);

  useEffect(() => {
    document.body.classList.add('watad-signin-popup-body');
    return () => document.body.classList.remove('watad-signin-popup-body');
  }, []);

  useEffect(() => {
    passApi.me()
      .then((res) => {
        rememberAccount({
          email: res.user.email,
          display_name: res.user.display_name,
          avatar_url: res.user.avatar_url,
        });
        if (finishSignInPopup()) return;
        window.location.replace('/');
      })
      .catch(() => undefined);
  }, []);

  async function afterLogin(
    user: { email: string; display_name?: string; avatar_url?: string },
    viaPasskey = false,
  ) {
    rememberAccount({ ...user, has_passkey: viaPasskey || undefined });
    if (finishSignInPopup()) return;
    const returnTo = new URLSearchParams(window.location.search).get('return_to');
    if (returnTo && (returnTo.startsWith('http://') || returnTo.startsWith('https://'))) {
      window.location.href = returnTo;
      return;
    }
    window.location.replace('/');
  }

  async function pickAccount(hint: WatadAccountHint) {
    setEmail(hint.email);
    setError(null);
    setBusy(true);
    try {
      await passApi.requestCode(hint.email, i18n.language.startsWith('ar') ? 'ar' : 'en');
      setStage('code');
    } catch (err) {
      setError(
        err instanceof PassApiError && err.code === 'rate_limited'
          ? t('pass.errors.rate')
          : err instanceof PassApiError && err.code === 'email_send_failed'
            ? t('pass.errors.emailSendFailed')
            : t('pass.errors.generic'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendNewEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await passApi.requestCode(email.trim(), i18n.language.startsWith('ar') ? 'ar' : 'en');
      setStage('code');
    } catch (err) {
      setError(
        err instanceof PassApiError && err.code === 'rate_limited'
          ? t('pass.errors.rate')
          : err instanceof PassApiError && err.code === 'email_send_failed'
            ? t('pass.errors.emailSendFailed')
            : t('pass.errors.generic'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await passApi.verifyCode(email.trim(), code);
      await afterLogin(res.user);
    } catch (err) {
      setError(
        err instanceof PassApiError && err.code === 'rate_limited'
          ? t('pass.errors.rate')
          : t('pass.errors.invalidCode'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function passkeyLogin(accountEmail?: string) {
    setBusy(true);
    setError(null);
    try {
      const begin = await passApi.passkeyLoginBegin(accountEmail);
      const options = (begin.publicKey ?? begin) as Record<string, unknown>;
      const assertion = await getAssertion(options);
      const res = await passApi.passkeyLoginFinish(assertion);
      await afterLogin(res.user, true);
    } catch (err) {
      if (!(err instanceof Error && err.message === 'cancelled')) {
        setError(t('pass.errors.passkey'));
      }
    } finally {
      setBusy(false);
    }
  }

  const siteHost = typeof window !== 'undefined' ? window.location.hostname : 'watadiq.com';
  const selectedHint = hints.find((h) => h.email.toLowerCase() === email.toLowerCase());

  return (
    <div className={`watad-account-picker ${popup ? 'watad-account-picker--popup' : ''}`}>
      <header className="watad-account-picker__header">
        <img
          src="/images/watad-one-lockup-44.png"
          alt="WATAD ONE"
          className="watad-account-picker__logo"
          height={36}
          width={108}
        />
        <div className="watad-account-picker__heading">
          <h1>{t('pass.accountPicker.title')}</h1>
          <p>{t('pass.accountPicker.continueTo', { site: siteHost })}</p>
        </div>
      </header>

      {error && (
        <div className="watad-account-picker__error" role="alert">
          <img src="/images/watad-logo-red.png" alt="" width={18} height={18} />
          <p>{error}</p>
        </div>
      )}

      {stage === 'choose' && (
        <div className="watad-account-picker__panel">
          <p className="watad-account-picker__subtitle">{t('pass.accountPicker.chooseAccount')}</p>

          {hints.length > 0 && (
            <ul className="watad-account-picker__list" role="listbox" aria-label={t('pass.accountPicker.chooseAccount')}>
              {hints.map((hint) => (
                <li key={hint.email}>
                  <button
                    type="button"
                    className="watad-account-picker__row"
                    disabled={busy}
                    onClick={() => pickAccount(hint)}
                    role="option"
                  >
                    <span className="watad-account-picker__avatar" aria-hidden="true">
                      {hint.avatar_url ? <img src={hint.avatar_url} alt="" /> : <span>{hintInitials(hint)}</span>}
                    </span>
                    <span className="watad-account-picker__row-text">
                      <strong>{hintLabel(hint)}</strong>
                      <span dir="ltr">{hint.email}</span>
                    </span>
                    <svg className="watad-account-picker__chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="watad-account-picker__another"
            disabled={busy}
            onClick={() => { setStage('email'); setEmail(''); setError(null); }}
          >
            <span className="watad-account-picker__avatar watad-account-picker__avatar--ghost" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </span>
            <span>{t('pass.accountPicker.useAnother')}</span>
          </button>

          {passkeyReady && (
            <button type="button" className="watad-account-picker__passkey" disabled={busy} onClick={() => passkeyLogin()}>
              {t('pass.withBiometricPasskey')}
            </button>
          )}
        </div>
      )}

      {stage === 'email' && (
        <div className="watad-account-picker__panel">
          <p className="watad-account-picker__subtitle">{t('pass.accountPicker.enterEmail')}</p>
          <form className="watad-account-picker__form" onSubmit={sendNewEmail}>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              dir="ltr"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="watad-account-picker__input"
            />
            <button type="submit" className="watad-account-picker__primary" disabled={busy}>
              {busy ? t('pass.wait') : t('pass.sendCode')}
            </button>
          </form>
          {hints.length > 0 && (
            <button type="button" className="watad-account-picker__back" onClick={() => { setStage('choose'); setError(null); }}>
              {t('pass.accountPicker.backToAccounts')}
            </button>
          )}
        </div>
      )}

      {stage === 'code' && (
        <div className="watad-account-picker__panel">
          <div className="watad-account-picker__selected">
            <span className="watad-account-picker__avatar" aria-hidden="true">
              {selectedHint?.avatar_url ? (
                <img src={selectedHint.avatar_url} alt="" />
              ) : (
                <span>{selectedHint ? hintInitials(selectedHint) : email.slice(0, 1).toUpperCase()}</span>
              )}
            </span>
            <div>
              <strong dir="ltr">{email}</strong>
              <p>{t('pass.codeSent')}</p>
            </div>
          </div>

          <form className="watad-account-picker__form" onSubmit={verifyCode}>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              autoComplete="one-time-code"
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="watad-account-picker__input watad-account-picker__input--code"
              aria-label={t('pass.code')}
            />
            <button type="submit" className="watad-account-picker__primary" disabled={busy}>
              {busy ? t('pass.wait') : t('pass.verify')}
            </button>
          </form>

          {passkeyReady && (
            <button type="button" className="watad-account-picker__passkey" disabled={busy} onClick={() => passkeyLogin(email)}>
              {t('pass.accountPicker.passkeyForAccount')}
            </button>
          )}

          <button
            type="button"
            className="watad-account-picker__back"
            onClick={() => { setStage(hints.length ? 'choose' : 'email'); setCode(''); setError(null); }}
          >
            {t('pass.accountPicker.backToAccounts')}
          </button>
        </div>
      )}

      <footer className="watad-account-picker__footer">
        <span>WATAD ONE</span>
        <span>{t('pass.accountPicker.footer')}</span>
      </footer>
    </div>
  );
}
