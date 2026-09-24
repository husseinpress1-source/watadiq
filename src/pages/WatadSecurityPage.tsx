import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageIntro from '../components/PageIntro';
import { FOOTER_SECURITY_BADGES } from '../data/footer-badges';
import { getPageHero } from '../data/page-heroes';
import './WatadSecurityPage.scss';

type SecurityStat = { value: string; label: string };
type SecurityPillar = {
  id: string;
  title: string;
  text: string;
  image: string;
  bullets: string[];
};
type SecurityStep = { title: string; text: string };

export default function WatadSecurityPage() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;

  const stats = t('securityPage.stats', { returnObjects: true }) as SecurityStat[];
  const pillars = t('securityPage.pillars', { returnObjects: true }) as SecurityPillar[];
  const process = t('securityPage.process', { returnObjects: true }) as SecurityStep[];
  const deliverables = t('securityPage.deliverables', { returnObjects: true }) as string[];
  const hero = getPageHero('security');

  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.45 },
      };

  return (
    <div className="security-page">
      <Header />

      <main className="security-page__main">
        <PageIntro
          eyebrow={t('securityPage.eyebrow')}
          title={t('securityPage.title')}
          intro={t('securityPage.lead')}
          cta={{ label: t('securityPage.ctaPrimary'), href: '/contact' }}
          ctaSecondary={{ label: t('securityPage.ctaSecondary'), href: '/pricing' }}
          heroImage={hero?.src}
          heroImageAlt={hero ? t(hero.altKey) : undefined}
        />

        <section className="security-page__stats" aria-label={t('securityPage.statsAria')}>
          <div className="security-page__shell security-page__stats-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="security-page__stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="security-page__pillars">
          <div className="security-page__shell">
            <header className="security-page__section-head security-page__section-head--center">
              <h2>{t('securityPage.pillarsTitle')}</h2>
              <p>{t('securityPage.pillarsLead')}</p>
            </header>

            <div className="security-page__pillar-grid">
              {pillars.map((pillar) => (
                <motion.article key={pillar.id} className="security-page__pillar" {...fade}>
                  <figure className="security-page__pillar-art">
                    <img src={pillar.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                  </figure>
                  <div className="security-page__pillar-body">
                    <h3>{pillar.title}</h3>
                    <p>{pillar.text}</p>
                    <ul>
                      {pillar.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="security-page__process">
          <div className="security-page__shell">
            <header className="security-page__section-head">
              <h2>{t('securityPage.processTitle')}</h2>
              <p>{t('securityPage.processLead')}</p>
            </header>

            <ol className="security-page__process-list">
              {process.map((step, index) => (
                <motion.li key={step.title} {...fade}>
                  <span className="security-page__process-index">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section className="security-page__standards">
          <div className="security-page__shell">
            <header className="security-page__section-head security-page__section-head--center">
              <h2>{t('securityPage.standardsTitle')}</h2>
              <p>{t('securityPage.standardsLead')}</p>
            </header>

            <ul className="security-page__badges">
              {FOOTER_SECURITY_BADGES.map((badge) => (
                <li key={badge.id}>
                  <img src={badge.src} alt={t(badge.altKey)} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="security-page__deliverables">
          <div className="security-page__shell security-page__deliverables-grid">
            <div>
              <h2>{t('securityPage.deliverablesTitle')}</h2>
              <p>{t('securityPage.deliverablesLead')}</p>
            </div>
            <ul>
              {deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="security-page__cta">
          <div className="security-page__shell security-page__cta-inner">
            <h2>{t('securityPage.ctaTitle')}</h2>
            <p>{t('securityPage.ctaText')}</p>
            <Link to="/contact" className="security-page__btn security-page__btn--primary">
              {t('securityPage.ctaPrimary')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
