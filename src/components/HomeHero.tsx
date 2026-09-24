import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { HERO_HOME, HERO_HOME_MOBILE, HERO_HOME_SRCSET } from '../data/homepage';
import './HomeHero.scss';

export default function HomeHero() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  return (
    <section className={classNames('home-hero', isArabic && 'home-hero--ar')} dir={isArabic ? 'rtl' : 'ltr'}>
      <picture>
        <source media="(max-width: 768px)" type="image/webp" srcSet={HERO_HOME_MOBILE} />
        <source type="image/webp" srcSet={HERO_HOME_SRCSET} sizes="100vw" />
        <img
          className="home-hero__bg"
          src={HERO_HOME}
          alt={t('pageHeroes.home')}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
          srcSet={HERO_HOME_SRCSET}
        />
      </picture>
      <div className="home-hero__overlay" aria-hidden="true" />

      <div className="home-hero__content">
        <div className="home-hero__copy" lang={isArabic ? 'ar' : 'en'}>
          <p className="home-hero__kicker">{t('hero.eyebrow')}</p>

          <h1 className="home-hero__title">
            <span className="home-hero__title-line">{t('hero.titleLine1')}</span>
            <span className="home-hero__title-line">{t('hero.titleLine2')}</span>
          </h1>

          <p className="home-hero__services">{t('hero.services')}</p>
          <p className="home-hero__lead">{t('hero.lead')}</p>
        </div>

        <div className="home-hero__actions">
          <Link to="/about" className="home-hero__cta home-hero__cta--primary">
            {t('hero.ourStory')}
          </Link>
          <Link to="/pricing" className="home-hero__cta home-hero__cta--outline">
            {t('hero.viewPlans')}
          </Link>
        </div>
      </div>

      <Link to="/expertise" className="home-hero__scroll-hint">
        {t('hero.exploreExpertise')}
      </Link>
    </section>
  );
}
