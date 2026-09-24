import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { exhibitionAssets } from '../data/homepage';
import HorizontalScroll from './HorizontalScroll';
import './ExhibitionsSection.scss';

interface ExhibitionCopy {
  title: string;
  overlay: string;
  subtitle: string;
}

export default function ExhibitionsSection() {
  const { t } = useTranslation();
  const items = t('home.exhibitions', { returnObjects: true }) as ExhibitionCopy[];

  return (
    <section className="exhibitions" id="expertise">
      <div className="exhibitions__header">
        <h2>{t('home.expertiseTitle')}</h2>
        <Link to="/expertise" className="exhibitions__view-all">{t('common.viewAll')}</Link>
      </div>

      <HorizontalScroll ariaLabel="Services carousel">
        {exhibitionAssets.map((asset, i) => {
          const copy = items[i];
          return (
            <Link key={asset.id} to={asset.href} className="exhibition-card scroll-card">
              <div className="exhibition-card__image-wrap">
                <img src={asset.image} alt={copy.title} loading="lazy" />
                {copy.overlay && (
                  <span className="exhibition-card__overlay">{copy.overlay}</span>
                )}
              </div>
              <h3>{copy.title}</h3>
              <p>{copy.subtitle}</p>
            </Link>
          );
        })}
      </HorizontalScroll>
    </section>
  );
}
