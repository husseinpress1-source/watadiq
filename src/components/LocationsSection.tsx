import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { locationAssets } from '../data/homepage';
import { getSiteIcon } from '../data/expertise-icons';
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
            const iconSrc = getSiteIcon(asset.icon);
            const content = (
              <>
                <div className="location-card__icon-wrap">
                  {iconSrc && (
                    <img src={iconSrc} alt="" className="location-card__icon" aria-hidden="true" />
                  )}
                </div>
                <div className="location-card__body">
                  <h3>{loc.name}</h3>
                  <p>
                    <strong>{t('common.hours')}</strong> {loc.hours}
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
                  <p className="location-card__note">{loc.note}</p>
                </div>
              </>
            );

            return asPage ? (
              <article key={asset.id} className="location-card">
                {content}
              </article>
            ) : (
              <Link key={asset.id} to={asset.href} className="location-card">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
