import { useTranslation } from 'react-i18next';
import './FooterBanner.scss';

export default function FooterBanner() {
  const { t } = useTranslation();

  return (
    <section className="footer-banner" aria-label={t('footer.bannerLabel')}>
      <div className="footer-banner__inner">
        <p className="footer-banner__title">{t('footer.bannerTitle')}</p>
        <p className="footer-banner__text">{t('footer.bannerText')}</p>
      </div>
    </section>
  );
}
