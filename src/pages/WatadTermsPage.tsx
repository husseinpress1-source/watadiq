import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageIntro from '../components/PageIntro';
import './WatadTermsPage.scss';

const TOC_KEYS = [
  'intro',
  'services',
  'eligibility',
  'projects',
  'payment',
  'ip',
  'client',
  'confidentiality',
  'warranties',
  'liability',
  'suspension',
  'governing',
  'changes',
  'contact',
] as const;

type SectionKey = (typeof TOC_KEYS)[number];

type TermsSection = {
  title: string;
  lead?: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
};

export default function WatadTermsPage() {
  const { t } = useTranslation();
  const sections = t('termsPage.sections', { returnObjects: true }) as Record<SectionKey, TermsSection>;
  const lastUpdated = t('termsPage.lastUpdated');
  const [activeSection, setActiveSection] = useState<SectionKey>('intro');

  useEffect(() => {
    const elements = TOC_KEYS.map((key) => document.getElementById(`terms-${key}`)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const visibility = new Map<SectionKey, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id.replace('terms-', '') as SectionKey;
          visibility.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let next: SectionKey = 'intro';
        let best = -1;

        TOC_KEYS.forEach((key) => {
          const score = visibility.get(key) ?? 0;
          if (score > best) {
            best = score;
            next = key;
          }
        });

        if (best > 0) {
          setActiveSection(next);
        }
      },
      {
        rootMargin: '-10% 0px -60% 0px',
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="legal-page terms-page">
      <Header />

      <main className="legal-page__main">
        <PageIntro
          eyebrow={t('termsPage.eyebrow')}
          title={t('termsPage.title')}
          intro={t('termsPage.lead')}
        />

        <div className="legal-page__body">
          <div className="legal-page__shell">
            <div className="legal-page__panel">
              <div className="legal-page__meta">
                <p className="legal-page__updated">{lastUpdated}</p>
              </div>

              <div className="legal-page__layout">
                <aside className="legal-page__toc" aria-label={t('termsPage.tocTitle')}>
                  <p className="legal-page__toc-title">{t('termsPage.tocTitle')}</p>
                  <nav>
                    <ul>
                      {TOC_KEYS.map((key, index) => (
                        <li key={key}>
                          <a
                            href={`#terms-${key}`}
                            className={activeSection === key ? 'is-active' : undefined}
                            aria-current={activeSection === key ? 'true' : undefined}
                          >
                            <span className="legal-page__toc-index">{index + 1}.</span>
                            <span className="legal-page__toc-text">{sections[key]?.title ?? key}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>

                <div className="legal-page__content">
                  {TOC_KEYS.map((key, index) => {
                    const sec = sections[key];
                    if (!sec) return null;

                    return (
                      <section key={key} id={`terms-${key}`} className="legal-page__section">
                        <h2>
                          <span className="legal-page__section-index">{index + 1}.</span>
                          {sec.title}
                        </h2>
                        {sec.lead && <p className="legal-page__lead">{sec.lead}</p>}
                        {sec.paragraphs?.map((p) => (
                          <p key={p.slice(0, 48)} className="legal-page__p">
                            {p}
                          </p>
                        ))}
                        {sec.bullets && sec.bullets.length > 0 && (
                          <ul className="legal-page__list">
                            {sec.bullets.map((b) => (
                              <li key={b.slice(0, 48)}>{b}</li>
                            ))}
                          </ul>
                        )}
                        {sec.note && <p className="legal-page__note">{sec.note}</p>}

                        {key === 'contact' && (
                          <p className="legal-page__contact">
                            <a href="mailto:info@watadiq.com">info@watadiq.com</a>
                            <span className="legal-page__contact-sep" aria-hidden="true">
                              ·
                            </span>
                            <Link to="/contact">{t('termsPage.contactForm')}</Link>
                          </p>
                        )}
                      </section>
                    );
                  })}

                  <section className="legal-page__footer-block">
                    <h2>{t('termsPage.relatedTitle')}</h2>
                    <p className="legal-page__footer-hint">{t('termsPage.relatedHint')}</p>
                    <Link to="/privacy" className="legal-page__footer-link">
                      {t('termsPage.relatedPrivacy')}
                    </Link>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
