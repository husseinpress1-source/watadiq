import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../context/CookieConsentContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
    <div className="privacy-page">
      <Header />

      <main className="privacy-page__main">
        <header className="privacy-page__hero">
          <div className="privacy-page__shell">
            <h1>{t('privacyPage.title')}</h1>
            <p className="privacy-page__updated">{lastUpdated}</p>
          </div>
        </header>

        <div className="privacy-page__body">
          <div className="privacy-page__shell privacy-page__layout">
            <aside className="privacy-page__toc" aria-label={t('privacyPage.tocTitle')}>
              <nav>
                <ul>
                  {TOC_KEYS.map((key, index) => (
                    <li key={key}>
                      <a
                        href={`#privacy-${key}`}
                        className={activeSection === key ? 'is-active' : undefined}
                        aria-current={activeSection === key ? 'true' : undefined}
                      >
                        <span className="privacy-page__toc-index">{index + 1}.</span>
                        <span className="privacy-page__toc-text">{sections[key]?.title ?? key}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="privacy-page__content">
              {TOC_KEYS.map((key, index) => {
                const sec = sections[key];
                if (!sec) return null;

                return (
                  <section key={key} id={`privacy-${key}`} className="privacy-page__section">
                    <h2>
                      <span className="privacy-page__section-index">{index + 1}.</span>
                      {sec.title}
                    </h2>
                    {sec.lead && <p className="privacy-page__lead">{sec.lead}</p>}
                    {sec.paragraphs?.map((p) => (
                      <p key={p.slice(0, 48)} className="privacy-page__p">
                        {p}
                      </p>
                    ))}
                    {sec.bullets && sec.bullets.length > 0 && (
                      <ul className="privacy-page__list">
                        {sec.bullets.map((b) => (
                          <li key={b.slice(0, 48)}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {sec.note && <p className="privacy-page__note">{sec.note}</p>}

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
                      <p className="privacy-page__contact">
                        <a href="mailto:info@watadiq.com">info@watadiq.com</a>
                        <span className="privacy-page__contact-sep" aria-hidden="true">
                          ·
                        </span>
                        <Link to="/contact">{t('privacyPage.contactForm')}</Link>
                      </p>
                    )}
                  </section>
                );
              })}

              <section className="privacy-page__manage">
                <h2>{t('privacyPage.manageCookiesTitle')}</h2>
                <p className="privacy-page__manage-hint">{t('privacyPage.manageCookiesHint')}</p>
                <button type="button" className="privacy-page__cookie-btn" onClick={openSettings}>
                  {t('cookies.manageLink')}
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
