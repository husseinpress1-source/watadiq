import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../context/CookieConsentContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageIntro from '../components/PageIntro';
import './WatadPrivacyPage.scss';

const TOC_KEYS = [
  'intro',
  'controller',
  'collect',
  'cookies',
  'legal',
  'use',
  'sharing',
  'retention',
  'security',
  'rights',
  'children',
  'changes',
  'contact',
] as const;

type SectionKey = (typeof TOC_KEYS)[number];

type PrivacySection = {
  title: string;
  lead?: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
};

export default function WatadPrivacyPage() {
  const { t } = useTranslation();
  const { openSettings } = useCookieConsent();
  const sections = t('privacyPage.sections', { returnObjects: true }) as Record<SectionKey, PrivacySection>;
  const cookieRows = t('privacyPage.cookieRows', { returnObjects: true }) as {
    type: string;
    purpose: string;
    duration: string;
  }[];
  const lastUpdated = t('privacyPage.lastUpdated');
  const [activeSection, setActiveSection] = useState<SectionKey>('intro');

  useEffect(() => {
    const elements = TOC_KEYS.map((key) => document.getElementById(`privacy-${key}`)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const visibility = new Map<SectionKey, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id.replace('privacy-', '') as SectionKey;
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
    <div className="legal-page privacy-page">
      <Header />

      <main className="legal-page__main">
        <PageIntro
          eyebrow={t('privacyPage.eyebrow')}
          title={t('privacyPage.title')}
          intro={t('privacyPage.lead')}
        />

        <div className="legal-page__body">
          <div className="legal-page__shell">
            <div className="legal-page__panel">
              <div className="legal-page__meta">
                <p className="legal-page__updated">{lastUpdated}</p>
              </div>

              <div className="legal-page__layout">
                <aside className="legal-page__toc" aria-label={t('privacyPage.tocTitle')}>
                  <p className="legal-page__toc-title">{t('privacyPage.tocTitle')}</p>
                  <nav>
                    <ul>
                      {TOC_KEYS.map((key, index) => (
                        <li key={key}>
                          <a
                            href={`#privacy-${key}`}
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
                      <section key={key} id={`privacy-${key}`} className="legal-page__section">
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

                        {key === 'cookies' && (
                          <>
                            <div className="privacy-page__cookie-cards">
                              {cookieRows.map((row) => (
                                <article key={row.type} className="privacy-page__cookie-card">
                                  <h3>{row.type}</h3>
                                  <dl>
                                    <div>
                                      <dt>{t('privacyPage.cookieColPurpose')}</dt>
                                      <dd>{row.purpose}</dd>
                                    </div>
                                    <div>
                                      <dt>{t('privacyPage.cookieColDuration')}</dt>
                                      <dd>{row.duration}</dd>
                                    </div>
                                  </dl>
                                </article>
                              ))}
                            </div>
                            <div className="privacy-page__table-wrap privacy-page__table-wrap--desktop">
                              <table className="privacy-page__table">
                                <thead>
                                  <tr>
                                    <th>{t('privacyPage.cookieColType')}</th>
                                    <th>{t('privacyPage.cookieColPurpose')}</th>
                                    <th>{t('privacyPage.cookieColDuration')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {cookieRows.map((row) => (
                                    <tr key={row.type}>
                                      <td>
                                        <strong>{row.type}</strong>
                                      </td>
                                      <td>{row.purpose}</td>
                                      <td>{row.duration}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}

                        {key === 'contact' && (
                          <p className="legal-page__contact">
                            <a href="mailto:info@watadiq.com">info@watadiq.com</a>
                            <span className="legal-page__contact-sep" aria-hidden="true">
                              ·
                            </span>
                            <Link to="/contact">{t('privacyPage.contactForm')}</Link>
                          </p>
                        )}
                      </section>
                    );
                  })}

                  <section className="legal-page__footer-block">
                    <h2>{t('privacyPage.manageCookiesTitle')}</h2>
                    <p className="legal-page__footer-hint">{t('privacyPage.manageCookiesHint')}</p>
                    <button type="button" className="legal-page__footer-btn" onClick={openSettings}>
                      {t('cookies.manageLink')}
                    </button>
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
