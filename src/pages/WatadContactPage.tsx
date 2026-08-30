import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageIntro from '../components/PageIntro';
import LocationsSection from '../components/LocationsSection';
import { getWatadPage } from '../i18n/helpers';
import { getPageHero } from '../data/page-heroes';
import { getSiteIconAssets } from '../data/expertise-icons';
import './WatadContactPage.scss';

export default function WatadContactPage() {
  const { t } = useTranslation();
  const page = getWatadPage(t, 'contact');

  if (!page) return <Navigate to="/" replace />;

  const channelsSection = page.sections.find((section) => section.id === 'contact-channels');
  const nextSection = page.sections.find((section) => section.id === 'contact-next');
  const channels = channelsSection?.cards ?? [];
  const steps = nextSection?.list ?? [];
  const hero = getPageHero('contact');

  return (
    <div className="contact-page">
      <Header />

      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        cta={page.cta}
        heroImage={hero?.src}
        heroImageMobile={hero?.mobileSrc}
        heroImageAlt={hero ? t(hero.altKey) : undefined}
      />

      <main className="contact-page__main">
        <div className="contact-page__shell">
          <div className="contact-page__grid">
            <section className="contact-page__block" id="contact-channels">
              <h2>{channelsSection?.title}</h2>
              <ul className="contact-page__channels">
                {channels.map((channel) => {
                  const iconAssets = getSiteIconAssets(channel.icon, 64);
                  const external = channel.href?.startsWith('http') ?? false;

                  return (
                    <li key={channel.title}>
                      <a
                        href={channel.href}
                        className="contact-page__channel"
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                      >
                        {iconAssets?.src && (
                          <span className="contact-page__channel-icon" aria-hidden="true">
                            <img
                              src={iconAssets.src}
                              srcSet={iconAssets.srcSet}
                              alt=""
                              width={iconAssets.width}
                              height={iconAssets.height}
                              loading="lazy"
                              decoding="async"
                            />
                          </span>
                        )}
                        <span className="contact-page__channel-copy">
                          <span className="contact-page__channel-label">{channel.title}</span>
                          <span className="contact-page__channel-value">{channel.text}</span>
                        </span>
                        <span className="contact-page__channel-arrow" aria-hidden="true">
                          →
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="contact-page__block" id="contact-next">
              <h2>{nextSection?.title}</h2>
              <ol className="contact-page__steps">
                {steps.map((step, index) => (
                  <li key={step}>
                    <span className="contact-page__step-index">{String(index + 1).padStart(2, '0')}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        <LocationsSection asPage />
      </main>

      <Footer />
    </div>
  );
}
