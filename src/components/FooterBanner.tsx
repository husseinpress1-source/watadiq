import { useTranslation } from 'react-i18next';
import { TECH_STACK } from '../data/tech-stack';
import './FooterBanner.scss';

const TECH_MARQUEE = TECH_STACK.filter((tech) => tech.name !== 'WATAD');
const marqueeTrack = [...TECH_MARQUEE, ...TECH_MARQUEE];

export default function FooterBanner() {
  const { t } = useTranslation();

  return (
    <section className="footer-banner" aria-label={t('footer.bannerLabel')}>
      <div className="footer-banner__tech" dir="ltr" aria-hidden="true">
        <div className="footer-banner__fade footer-banner__fade--left" />
        <div className="footer-banner__fade footer-banner__fade--right" />

        <div className="footer-banner__tech-viewport">
          <ul className="footer-banner__tech-track">
            {marqueeTrack.map((tech, index) => (
              <li key={`${tech.name}-${index}`} className="footer-banner__tech-item">
                <img
                  className="footer-banner__tech-icon"
                  src={tech.icon}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <span className="footer-banner__tech-label">{tech.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-banner__copy">
        <p className="footer-banner__title">{t('footer.bannerTitle')}</p>
        <p className="footer-banner__text">{t('footer.bannerText')}</p>
      </div>
    </section>
  );
}
