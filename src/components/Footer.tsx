import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../context/CookieConsentContext';
import { FOOTER_SECURITY_BADGES } from '../data/footer-badges';
import FooterBanner from './FooterBanner';
import './Footer.scss';

export default function Footer() {
  const { t } = useTranslation();
  const { openSettings } = useCookieConsent();

  const aboutLinks = [
    { key: 'about', href: '/about' },
    { key: 'expertise', href: '/expertise' },
    { key: 'work', href: '/work' },
    { key: 'team', href: '/team' },
  ];
  const supportLinks = [
    { key: 'pricing', href: '/pricing' },
    { key: 'contact', href: '/contact' },
    { key: 'getQuote', href: '/contact' },
  ];

  return (
    <footer className="met-footer">
      <section className="met-footer__crest" aria-label={t('footer.bannerLabel')}>
        <div className="met-footer__wave met-footer__wave--top" aria-hidden="true">
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,24 C220,4 440,32 660,14 C880,0 1100,28 1320,10 C1380,16 1410,12 1440,14 V56 H0 Z" />
          </svg>
        </div>
        <FooterBanner />
      </section>

      <div className="met-footer__main">
        <div className="met-footer__inner">
          <div className="met-footer__brand">
            <div className="met-footer__logo">
              <img src="/images/watad-logo-red.png" alt="وتد Watad" />
            </div>
            <div className="met-footer__locations">
              <div>
                <strong>{t('footer.hqTitle')}</strong>
                <p>info@watadiq.com</p>
                <p>Instagram: @watd_iq</p>
                <p>{t('footer.serving')}</p>
              </div>
              <div>
                <strong>{t('footer.hoursTitle')}</strong>
                <p>{t('footer.hours1')}</p>
                <p>{t('footer.hours2')}</p>
                <p>{t('footer.hours3')}</p>
              </div>
            </div>
          </div>

          <div className="met-footer__links">
            <div>
              <h3>{t('footer.aboutWatad')}</h3>
              <ul>
                {aboutLinks.map((link) => (
                  <li key={link.key}><Link to={link.href}>{t(`nav.${link.key}`)}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t('footer.services')}</h3>
              <ul>
                {supportLinks.map((link) => (
                  <li key={link.key}><Link to={link.href}>{t(`common.${link.key}`)}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t('footer.expertise')}</h3>
              <ul>
                <li><Link to="/expertise">{t('footer.webDev')}</Link></li>
                <li><Link to="/expertise">{t('footer.mobileApps')}</Link></li>
                <li><Link to="/security">{t('footer.cybersecurity')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="met-footer__wave met-footer__wave--legal" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,52 C220,96 440,20 660,56 C880,92 1100,28 1320,64 C1380,76 1410,48 1440,60 V120 H0 Z" />
        </svg>
      </div>

      <div className="met-footer__legal">
        <div className="met-footer__legal-inner">
          <div className="met-footer__badges" role="list" aria-label={t('footer.securityBadgesLabel')}>
            {FOOTER_SECURITY_BADGES.map((badge) => (
              <img
                key={badge.id}
                className="met-footer__badge"
                src={badge.src}
                alt={t(badge.altKey)}
                loading="lazy"
                decoding="async"
                role="listitem"
              />
            ))}
          </div>
          <p>{t('footer.copyright')}</p>
          <div className="met-footer__legal-links">
            <Link to="/privacy" className="met-footer__legal-link">{t('footer.privacy')}</Link>
            <span className="met-footer__legal-sep" aria-hidden="true">·</span>
            <Link to="/terms" className="met-footer__legal-link">{t('footer.terms')}</Link>
          </div>
          <button type="button" className="met-footer__cookie-link" onClick={openSettings}>
            {t('cookies.manageLink')}
          </button>
        </div>
      </div>
    </footer>
  );
}
