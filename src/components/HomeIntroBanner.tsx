import { useTranslation } from 'react-i18next';
import './HomeIntroBanner.scss';

export default function HomeIntroBanner() {
  const { t } = useTranslation();

  return (
    <section className="home-intro-banner" aria-label={t('footer.bannerLabel')}>
      <div className="home-intro-banner__inner">
        <p className="home-intro-banner__title">{t('footer.bannerTitle')}</p>
        <p className="home-intro-banner__text">{t('footer.bannerText')}</p>
      </div>
    </section>
  );
}
