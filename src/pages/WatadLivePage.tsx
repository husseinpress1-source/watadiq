import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLegacyPlugins } from '../lib/plugins';
import LiveLaunchTimeline from '../components/LiveLaunchTimeline';
import './WatadLivePage.scss';

const ease = [0.22, 1, 0.36, 1] as const;

export default function WatadLivePage() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  useLegacyPlugins();

  const features = t('live.features', { returnObjects: true }) as { title: string; text: string }[];
  const platforms = t('live.platforms', { returnObjects: true }) as { name: string; status: string }[];
  const spotlights = t('live.spotlights', { returnObjects: true }) as {
    title: string;
    text: string;
    image: string;
    imageAlt: string;
  }[];

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease },
      };

  return (
    <div className="watad-live-page">
      <Header />

      <main className="live-main">
        <section className="live-hero" aria-labelledby="live-hero-title">
          <picture className="live-hero__art" aria-hidden="true">
            <source media="(min-width: 1025px)" srcSet="/images/live/hero-desktop.png" />
            <img
              src="/images/live/hero-mobile.png"
              alt=""
              loading="eager"
              decoding="async"
              width={1080}
              height={1920}
            />
          </picture>
          <div className="live-hero__scrim" aria-hidden="true" />

          <div className="live-hero__inner">
            <motion.div className="live-hero__copy" {...fadeUp}>
              <h1 id="live-hero-title">{t('live.heroTitle')}</h1>
              <p className="live-hero__tagline">{t('live.heroTagline')}</p>
              <p className="live-hero__lead">{t('live.heroLead')}</p>

              <div className="live-hero__status" aria-label={t('live.statusBadge')}>
                <span className="live-hero__status-label">{t('live.statusBadge')}</span>
                <span className="live-hero__status-dot" aria-hidden="true" />
                <span className="live-hero__status-version">{t('live.versionLabel')}</span>
              </div>
            </motion.div>

            <div className="live-hero__actions">
              <div className="live-hero__buttons">
                <Link to="/contact" className="live-btn live-btn--primary live-btn--hero">
                  {t('live.ctaSubscribe')}
                </Link>
                <a href="#features" className="live-btn live-btn--ghost live-btn--hero">
                  {t('live.ctaExplore')}
                </a>
              </div>
              <p className="live-hero__by">{t('live.byWatad')}</p>
            </div>
          </div>
        </section>

        <section id="features" className="live-block" aria-labelledby="live-features-title">
          <div className="live-block__inner">
            <header className="live-block__head live-block__head--center">
              <p className="live-eyebrow">{t('live.featuresEyebrow')}</p>
              <h2 id="live-features-title">{t('live.featuresTitle')}</h2>
              <p className="live-block__intro">{t('live.featuresIntro')}</p>
            </header>

            <div className="live-bento">
              {features.map((feature, index) => (
                <article key={feature.title} className="live-bento__card">
                  <span className="live-bento__index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="live-block live-block--dark" aria-label={t('live.featuresEyebrow')}>
          <div className="live-block__inner">
            {spotlights.map((spot, index) => (
              <article
                key={spot.title}
                className={`live-spotlight${index % 2 === 1 ? ' live-spotlight--reverse' : ''}`}
              >
                <div className="live-spotlight__copy">
                  <h2>{spot.title}</h2>
                  <p>{spot.text}</p>
                </div>
                <div className="live-spotlight__media">
                  <img src={spot.image} alt={spot.imageAlt} loading="lazy" decoding="async" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="live-block" aria-labelledby="live-platforms-title">
          <div className="live-block__inner live-block__inner--narrow">
            <header className="live-block__head live-block__head--center">
              <p className="live-eyebrow">{t('live.platformsEyebrow')}</p>
              <h2 id="live-platforms-title">{t('live.platformsTitle')}</h2>
            </header>
            <ul className="live-platforms live-platforms--center">
              {platforms.map((platform) => (
                <li key={platform.name} className="live-platforms__item">
                  <strong>{platform.name}</strong>
                  <span>{platform.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <LiveLaunchTimeline />

        <section className="live-cta" aria-labelledby="live-cta-title">
          <div className="live-cta__inner">
            <h2 id="live-cta-title">{t('live.ctaTitle')}</h2>
            <p>{t('live.ctaText')}</p>
            <Link to="/contact" className="live-btn live-btn--dark live-btn--large">
              {t('live.ctaSubscribe')}
            </Link>
            <p className="live-cta__note">{t('live.ctaNote')}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
