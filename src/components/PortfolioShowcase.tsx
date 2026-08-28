import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '../data/portfolio';
import './PortfolioShowcase.scss';

export default function PortfolioShowcase() {
  const { t } = useTranslation();
  const [active, setActive] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  const features = (project: PortfolioProject) =>
    t(`portfolio.projects.${project.i18nKey}.features`, { returnObjects: true }) as string[];

  return (
    <section className="portfolio-showcase" aria-label={t('portfolio.sectionLabel')}>
      <p className="portfolio-showcase__eyebrow">{t('portfolio.featuredLabel')}</p>

      <div className="portfolio-showcase__grid">
        {PORTFOLIO_PROJECTS.map((project, index) => (
          <article
            key={project.id}
            className="portfolio-showcase__card"
            style={{ animationDelay: `${0.2 + index * 0.15}s` }}
          >
            <div className="portfolio-showcase__media">
              <img
                className="portfolio-showcase__shot"
                src={project.screenshot}
                alt={t(`portfolio.projects.${project.i18nKey}.title`)}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="portfolio-showcase__body">
              <div className="portfolio-showcase__head">
                <img
                  src={project.logo}
                  alt=""
                  className="portfolio-showcase__logo"
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                />
                <div>
                  <p className="portfolio-showcase__category">
                    {t(`portfolio.projects.${project.i18nKey}.category`)}
                  </p>
                  <h3>{t(`portfolio.projects.${project.i18nKey}.title`)}</h3>
                </div>
              </div>

              <p className="portfolio-showcase__summary">
                {t(`portfolio.projects.${project.i18nKey}.summary`)}
              </p>

              <div className="portfolio-showcase__actions">
                <button
                  type="button"
                  className="portfolio-showcase__btn portfolio-showcase__btn--primary"
                  onClick={() => setActive(project)}
                >
                  {t('portfolio.viewDetails')}
                </button>
                <a
                  href={project.url}
                  className="portfolio-showcase__btn portfolio-showcase__btn--secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('portfolio.visitSite')}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div className="portfolio-showcase__modal" role="presentation" onClick={() => setActive(null)}>
          <div
            className="portfolio-showcase__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="portfolio-showcase__close"
              aria-label={t('portfolio.close')}
              onClick={() => setActive(null)}
            >
              ×
            </button>

            <div className="portfolio-showcase__dialog-media">
              <img
                src={active.screenshot}
                alt={t(`portfolio.projects.${active.i18nKey}.title`)}
                className="portfolio-showcase__dialog-shot"
              />
            </div>

            <div className="portfolio-showcase__dialog-body">
              <div className="portfolio-showcase__dialog-head">
                <img
                  src={active.logo}
                  alt=""
                  className="portfolio-showcase__dialog-logo"
                  aria-hidden="true"
                />
                <div>
                  <p className="portfolio-showcase__dialog-category">
                    {t(`portfolio.projects.${active.i18nKey}.category`)}
                  </p>
                  <h2 id="portfolio-dialog-title">
                    {t(`portfolio.projects.${active.i18nKey}.title`)}
                  </h2>
                </div>
              </div>

              <p className="portfolio-showcase__dialog-text">
                {t(`portfolio.projects.${active.i18nKey}.description`)}
              </p>

              <ul className="portfolio-showcase__features">
                {features(active).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="portfolio-showcase__dialog-actions">
                <a
                  href={active.url}
                  className="portfolio-showcase__btn portfolio-showcase__btn--primary portfolio-showcase__dialog-cta"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('portfolio.visitSite')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
