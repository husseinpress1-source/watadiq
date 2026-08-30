import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { locationAssets } from '../data/homepage';
import './LocationsSection.scss';

interface LocationCopy {
  name: string;
  hours: string;
  extendedHours: string;
  closed: string;
  note: string;
}

interface LocationsSectionProps {
  asPage?: boolean;
}

function isExternalHref(href: string) {
  return href.startsWith('http') || href.startsWith('mailto:');
}

function usesHoursLabel(icon: string) {
  return icon === 'contact-hours';
}

function getContactBackground(imageStem: string) {
  return {
    src: `/assets/contact/${imageStem}-640.webp`,
    srcSet: `/assets/contact/${imageStem}-640.webp 640w, /assets/contact/${imageStem}-960.webp 960w`,
  };
}

export default function LocationsSection({ asPage = false }: LocationsSectionProps) {
  const { t } = useTranslation();
  const items = t('home.locations', { returnObjects: true }) as LocationCopy[];

  return (
    <section
      className={cn('locations', { 'locations--page': asPage })}
      id={asPage ? 'contact-hours' : 'contact'}
    >
      <div className="locations__inner">
        <h2>{t('home.contactHours')}</h2>
        <div className="locations__grid">
          {locationAssets.map((asset, i) => {
            const loc = items[i];
            const background = getContactBackground(asset.image);
            const external = isExternalHref(asset.href);
            const showHoursLabel = usesHoursLabel(asset.icon);

            const content = (
              <>
                <picture className="location-card__media" aria-hidden="true">
                  <source srcSet={background.srcSet} sizes="(max-width: 768px) 100vw, 440px" type="image/webp" />
                  <img
                    src={background.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="location-card__image"
                  />
                </picture>
                <div className="location-card__shade" aria-hidden="true" />
                <div className="location-card__content">
                  <h3>{loc.name}</h3>
                  <div className="location-card__lines">
                    <p>
                      {showHoursLabel ? (
                        <>
                          <strong>{t('common.hours')}</strong> {loc.hours}
                        </>
                      ) : (
                        loc.hours
                      )}
                    </p>
                    {loc.extendedHours && (
                      <p>
                        <strong>{t('common.also')}</strong> {loc.extendedHours}
                      </p>
                    )}
                    {loc.closed && (
                      <p>
                        <strong>{t('common.closed')}</strong> {loc.closed}
                      </p>
                    )}
                  </div>
                  <p className="location-card__note">{loc.note}</p>
                </div>
              </>
            );

            const className = cn('location-card', `location-card--${asset.image.replace('contact-bg-', '')}`);

            if (asPage) {
              return (
                <article key={asset.id} className={className}>
                  {content}
                </article>
              );
            }

            if (external) {
              return (
                <a
                  key={asset.id}
                  href={asset.href}
                  className={className}
                  target={asset.href.startsWith('http') ? '_blank' : undefined}
                  rel={asset.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={asset.id} to={asset.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
