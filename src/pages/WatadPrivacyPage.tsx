import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../context/CookieConsentContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PassPageTitle, PassSection } from '../components/pass/pass-ui';
import './pass/pass-tw.css';
import './WatadPrivacyPage.scss';
const TOC_KEYS = [
  'intro',
  'controller',
  'collect',
  'cookies',
  'watadOne',
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
  const cookieRows = t('privacyPage.cookieRows', { returnObjects: true }) as { type: string; purpose: string; duration: string }[];
  const lastUpdated = t('privacyPage.lastUpdated');

  return (
    <div className="privacy-page">
      <Header />
      <div className="privacy-page__wrap">
        <PassPageTitle title={t('privacyPage.title')} lead={t('privacyPage.lead')} />
        <p className="privacy-page__updated">{lastUpdated}</p>

        <div className="privacy-page__layout">
          <aside className="privacy-page__toc" aria-label={t('privacyPage.tocTitle')}>
            <p className="privacy-page__toc-label">{t('privacyPage.tocTitle')}</p>
            <nav>
              <ul>
                {TOC_KEYS.map((key) => (
                  <li key={key}>
                    <a href={`#privacy-${key}`}>{sections[key]?.title ?? key}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="privacy-page__content">
            {TOC_KEYS.map((key) => {
              const sec = sections[key];
              if (!sec) return null;
              return (
                <section key={key} id={`privacy-${key}`} className="privacy-page__section">
                  <h2>{sec.title}</h2>
                  {sec.lead && <p className="privacy-page__lead">{sec.lead}</p>}
                  {sec.paragraphs?.map((p) => (
                    <p key={p.slice(0, 48)} className="privacy-page__p">{p}</p>
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
                                <td><strong>{row.type}</strong></td>
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
                      {' · '}
                      <Link to="/contact">{t('privacyPage.contactForm')}</Link>
                    </p>
                  )}
                </section>
              );
            })}

            <PassSection title={t('privacyPage.manageCookiesTitle')} hint={t('privacyPage.manageCookiesHint')}>
              <button type="button" className="privacy-page__cookie-btn" onClick={openSettings}>
                {t('cookies.manageLink')}
              </button>
            </PassSection>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
