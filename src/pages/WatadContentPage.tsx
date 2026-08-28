import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import PricingCards from '../components/PricingCards';
import PaymentOptions from '../components/PaymentOptions';
import LocationsSection from '../components/LocationsSection';
import { getWatadPage } from '../i18n/helpers';
import { getPageHero } from '../data/page-heroes';
import { getSiteIcon, getSiteIconAssets } from '../data/expertise-icons';
import { useLegacyPlugins } from '../lib/plugins';
import './WatadContentPage.scss';

export default function WatadContentPage() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const slug = pathname.replace(/^\//, '');
  const page = getWatadPage(t, slug);
  useLegacyPlugins();

  if (!page) return <Navigate to="/" replace />;

  return (
    <div className={`watad-content-page${slug === 'pricing' ? ' watad-content-page--pricing' : ''}${slug === 'contact' ? ' watad-content-page--contact' : ''}${slug === 'team' ? ' watad-content-page--team' : ''}${slug === 'about' ? ' watad-content-page--about' : ''}`}>
      <Header />
      <PageHero
        image={getPageHero(slug)}
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        cta={page.cta}
      />

      <main className="watad-content-page__main">
        {page.sections.map((section) => (
          <section
            key={section.title ?? section.id}
            className={`watad-content-page__section${
              section.pricingPlans ? ' watad-content-page__section--pricing' : ''
            }${section.paymentOptions ? ' watad-content-page__section--payments' : ''}${
              section.id === 'contact-channels' ? ' watad-content-page__section--contact-channels' : ''
            }${section.id === 'core-team' ? ' watad-content-page__section--core-team' : ''}`}
            id={section.id}
          >
            {section.title && section.id !== 'core-team' && <h2>{section.title}</h2>}
            {section.paragraphs?.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
            {section.pricingPlans && (
              <PricingCards plans={section.pricingPlans} />
            )}
            {section.paymentOptions && (
              <PaymentOptions options={section.paymentOptions} />
            )}
            {section.list && !section.paymentOptions ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.cards && (
              <div className={section.id === 'core-team' ? 'watad-content-page__team-block' : undefined}>
                {section.id === 'core-team' && section.title && (
                  <header className="watad-content-page__team-head">
                    <h2>{section.title}</h2>
                  </header>
                )}
                <div
                  className={`watad-content-page__cards${
                    section.cards.some((c) => c.icon) ? ' watad-content-page__cards--disciplines' : ''
                  }${section.id === 'contact-channels' ? ' watad-content-page__cards--contact' : ''}${
                    section.id === 'core-team' ? ' watad-content-page__cards--team' : ''
                  }`}
                >
                {section.cards.map((card) => {
                  const iconAssets = getSiteIconAssets(
                    card.icon,
                    slug === 'about' ? 176 : section.id === 'contact-channels' ? 80 : 112,
                  );
                  const iconSrc = iconAssets?.src ?? getSiteIcon(card.icon);
                  const cardClass = `watad-content-page__card${iconSrc ? ' watad-content-page__card--discipline' : ''}${
                    card.photo ? ' watad-content-page__card--team' : ''
                  }${card.href ? ' watad-content-page__card--link' : ''}`;
                  const inner = (
                    <>
                      {card.photo && (
                        <div className="watad-content-page__card-photo-wrap">
                          <img
                            src={card.photo}
                            alt={card.title}
                            className="watad-content-page__card-photo"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                      {iconSrc && (
                        <div className="watad-content-page__card-icon-wrap">
                          <img
                            src={iconAssets?.src ?? iconSrc}
                            srcSet={iconAssets?.srcSet}
                            alt=""
                            className="watad-content-page__card-icon"
                            aria-hidden="true"
                            width={iconAssets?.width ?? 112}
                            height={iconAssets?.height ?? 112}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                      <div className="watad-content-page__card-body">
                        <h3>{card.title}</h3>
                        {card.meta && (
                          <div className="watad-content-page__card-meta-row">
                            {card.meta.split('·').map((tag) => (
                              <span key={tag.trim()} className="watad-content-page__card-meta">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        <p>{card.text}</p>
                      </div>
                    </>
                  );

                  return card.href ? (
                    <a
                      key={card.title}
                      href={card.href}
                      className={cardClass}
                      target={card.href.startsWith('http') ? '_blank' : undefined}
                      rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      {inner}
                    </a>
                  ) : (
                    <article key={card.title} className={cardClass}>
                      {inner}
                    </article>
                  );
                })}
                </div>
              </div>
            )}
          </section>
        ))}

      </main>

      {slug === 'contact' && <LocationsSection asPage />}

      <Footer />
    </div>
  );
}
