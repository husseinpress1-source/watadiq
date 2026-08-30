import { useTranslation } from 'react-i18next';
import { TECH_STACK } from '../data/tech-stack';
import './FooterBanner.scss';

const TECH_MARQUEE = TECH_STACK.filter((tech) => tech.name !== 'WATAD');
const marqueeTrack = [...TECH_MARQUEE, ...TECH_MARQUEE];

export default function FooterBanner() {
  const { t } = useTranslation();

  return (
    <section className="footer-banner" aria-label={t('footer.techLabel')}>
      <div className="footer-banner__fade footer-banner__fade--left" aria-hidden="true" />
      <div className="footer-banner__fade footer-banner__fade--right" aria-hidden="true" />

      <div className="footer-banner__viewport" dir="ltr">
        <ul className="footer-banner__track">
          {marqueeTrack.map((tech, index) => (
            <li key={`${tech.name}-${index}`} className="footer-banner__item">
              <img
                className="footer-banner__icon"
                src={tech.icon}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <span className="footer-banner__label">{tech.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
