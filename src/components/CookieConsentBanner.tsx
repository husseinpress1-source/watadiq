import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../context/CookieConsentContext';
import './CookieConsentBanner.scss';

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const {
    visible,
    settingsOpen,
    preferences,
    openSettings,
    closeSettings,
    acceptAll,
    rejectOptional,
    savePreferences,
  } = useCookieConsent();

  const [portalReady, setPortalReady] = useState(false);
  const [analytics, setAnalytics] = useState(preferences.analytics);
  const [marketing, setMarketing] = useState(preferences.marketing);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setAnalytics(preferences.analytics);
    setMarketing(preferences.marketing);
  }, [preferences]);

  if (!portalReady || !visible) return null;

  const content = settingsOpen ? (
    <div className="cookie-consent cookie-consent--modal" role="dialog" aria-modal="true" aria-label={t('cookies.settingsTitle')}>
      <button
        type="button"
        className="cookie-consent__backdrop"
        aria-label={t('cookies.closeSettings')}
        onClick={closeSettings}
      />

      <div className="cookie-consent__panel cookie-consent__panel--settings">
        <div className="cookie-consent__settings-head">
          <div className="cookie-consent__icon" aria-hidden="true">
            <img src="/assets/icons/cookie-consent-64.png" alt="" width={48} height={48} />
          </div>
          <div>
            <h2 className="cookie-consent__title">{t('cookies.settingsTitle')}</h2>
            <p className="cookie-consent__text">{t('cookies.settingsLead')}</p>
          </div>
        </div>

        <ul className="cookie-consent__categories">
          <li className="cookie-consent__category cookie-consent__category--locked">
            <div>
              <strong>{t('cookies.categories.necessary.title')}</strong>
              <p>{t('cookies.categories.necessary.desc')}</p>
            </div>
            <span className="cookie-consent__always">{t('cookies.alwaysOn')}</span>
          </li>

          <li className="cookie-consent__category">
            <div>
              <strong>{t('cookies.categories.analytics.title')}</strong>
              <p>{t('cookies.categories.analytics.desc')}</p>
            </div>
            <label className="cookie-consent__toggle">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              <span aria-hidden="true" />
            </label>
          </li>

          <li className="cookie-consent__category">
            <div>
              <strong>{t('cookies.categories.marketing.title')}</strong>
              <p>{t('cookies.categories.marketing.desc')}</p>
            </div>
            <label className="cookie-consent__toggle">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              <span aria-hidden="true" />
            </label>
          </li>
        </ul>

        <div className="cookie-consent__actions cookie-consent__actions--settings">
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={() => savePreferences({ analytics, marketing })}
          >
            {t('cookies.savePreferences')}
          </button>
          <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={closeSettings}>
            {t('cookies.back')}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="cookie-consent cookie-consent--bar" role="region" aria-label={t('cookies.ariaLabel')}>
      <div className="cookie-consent__panel">
        <div className="cookie-consent__bar">
          <div className="cookie-consent__leading">
            <div className="cookie-consent__icon" aria-hidden="true">
              <img src="/assets/icons/cookie-consent-64.png" alt="" width={48} height={48} />
            </div>
            <div className="cookie-consent__body">
              <h2 className="cookie-consent__title">{t('cookies.title')}</h2>
              <p className="cookie-consent__text">{t('cookies.description')}</p>
              <p className="cookie-consent__legal">
                {t('cookies.learnMore')}{' '}
                <Link to="/privacy">{t('cookies.privacyLink')}</Link>
                {' '}{t('cookies.and')}{' '}
                <Link to="/terms">{t('cookies.termsLink')}</Link>
              </p>
            </div>
          </div>

          <div className="cookie-consent__actions">
            <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={acceptAll}>
              {t('cookies.acceptAll')}
            </button>
            <button type="button" className="cookie-consent__btn cookie-consent__btn--secondary" onClick={openSettings}>
              {t('cookies.customize')}
            </button>
            <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={rejectOptional}>
              {t('cookies.rejectOptional')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
