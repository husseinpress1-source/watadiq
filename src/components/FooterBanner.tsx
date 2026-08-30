import { useTranslation } from 'react-i18next';
import { getSiteIconAssets, type ExpertiseIcon } from '../data/expertise-icons';
import './FooterBanner.scss';

const FOOTER_ICONS: ExpertiseIcon[] = ['web', 'mobile', 'design', 'security', 'commerce', 'cloud'];

function IconMarquee() {
  const icons = [...FOOTER_ICONS, ...FOOTER_ICONS];

  return (
    <div className="footer-banner__icon-row" aria-hidden="true">
      <div className="footer-banner__icon-track">
        {icons.map((icon, index) => {
          const assets = getSiteIconAssets(icon, 56);
          if (!assets) return null;

          return (
            <span key={`${icon}-${index}`} className="footer-banner__icon-item">
              <img
                src={assets.src}
                srcSet={assets.srcSet}
                alt=""
                width={assets.width}
                height={assets.height}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function FooterBanner() {
  const { t } = useTranslation();

  return (
    <section className="footer-banner" aria-label={t('footer.bannerLabel')}>
      <div className="footer-banner__copy">
        <p className="footer-banner__title">{t('footer.bannerTitle')}</p>
        <p className="footer-banner__text">{t('footer.bannerText')}</p>
      </div>

      <IconMarquee />
    </section>
  );
}
