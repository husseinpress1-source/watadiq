import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
    <div className="terms-page">
      <Header />

      <main className="terms-page__main">
        <header className="terms-page__hero">
          <div className="terms-page__shell">
            <h1>{t('termsPage.title')}</h1>
            <p className="terms-page__updated">{lastUpdated}</p>
          </div>
        </header>

        <div className="terms-page__body">
          <div className="terms-page__shell terms-page__layout">
            <aside className="terms-page__toc" aria-label={t('termsPage.tocTitle')}>
              <nav>
                <ul>
                  {TOC_KEYS.map((key, index) => (
                    <li key={key}>
                      <a
                        href={`#terms-${key}`}
                        className={activeSection === key ? 'is-active' : undefined}
                        aria-current={activeSection === key ? 'true' : undefined}
                      >
                        <span className="terms-page__toc-index">{index + 1}.</span>
                        <span className="terms-page__toc-text">{sections[key]?.title ?? key}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="terms-page__content">
              {TOC_KEYS.map((key, index) => {
                const sec = sections[key];
                if (!sec) return null;

                return (
                  <section key={key} id={`terms-${key}`} className="terms-page__section">
                    <h2>
                      <span className="terms-page__section-index">{index + 1}.</span>
                      {sec.title}
                    </h2>
                    {sec.lead && <p className="terms-page__lead">{sec.lead}</p>}
                    {sec.paragraphs?.map((p) => (
                      <p key={p.slice(0, 48)} className="terms-page__p">
                        {p}
                      </p>
                    ))}
                    {sec.bullets && sec.bullets.length > 0 && (
                      <ul className="terms-page__list">
                        {sec.bullets.map((b) => (
                          <li key={b.slice(0, 48)}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {sec.note && <p className="terms-page__note">{sec.note}</p>}

                    {key === 'contact' && (
                      <p className="terms-page__contact">
                        <a href="mailto:info@watadiq.com">info@watadiq.com</a>
                        <span className="terms-page__contact-sep" aria-hidden="true">
                          ·
                        </span>
                        <Link to="/contact">{t('termsPage.contactForm')}</Link>
                      </p>
                    )}
                  </section>
                );
              })}

              <section className="terms-page__related">
                <h2>{t('termsPage.relatedTitle')}</h2>
                <p className="terms-page__related-hint">{t('termsPage.relatedHint')}</p>
                <Link to="/privacy" className="terms-page__related-link">
                  {t('termsPage.relatedPrivacy')}
                </Link>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
