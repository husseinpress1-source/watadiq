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
      <div className="met-footer__wave met-footer__wave--top" aria-hidden="true">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,46 C220,46 360,10 580,24 C800,38 960,62 1180,44 C1310,34 1380,50 1440,42 V72 H0 Z" />
        </svg>
      </div>

      <FooterBanner />

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
                <li><Link to="/expertise">{t('footer.cybersecurity')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="met-footer__wave met-footer__wave--legal" aria-hidden="true">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,34 C240,58 480,12 720,38 C960,64 1200,18 1440,40 V72 H0 Z" />
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
          <Link to="/privacy" className="met-footer__legal-link">{t('footer.privacy')}</Link>
          <button type="button" className="met-footer__cookie-link" onClick={openSettings}>
            {t('cookies.manageLink')}
          </button>
        </div>
      </div>
    </footer>
  );
}
