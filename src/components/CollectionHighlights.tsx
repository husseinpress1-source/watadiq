import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { highlightAssets } from '../data/homepage';
import HorizontalScroll from './HorizontalScroll';
import './CollectionHighlights.scss';

interface HighlightCopy {
  title: string;
  subtitle: string;
}

export default function CollectionHighlights() {
  const { t } = useTranslation();
  const items = t('home.highlights', { returnObjects: true }) as HighlightCopy[];

  return (
    <section className="highlights">
      <div className="highlights__inner">
        <h2>{t('home.selectedWork')}</h2>
        <HorizontalScroll ariaLabel="Portfolio carousel">
          {highlightAssets.map((asset, i) => {
            const copy = items[i];
            return (
              <Link key={asset.id} to={asset.href} className="highlight-card scroll-card">
                <div className="highlight-card__image-wrap">
                  <img src={asset.image} alt={copy.title} loading="lazy" />
                </div>
                <h3>{copy.title}</h3>
                <p>{copy.subtitle}</p>
              </Link>
            );
          })}
        </HorizontalScroll>
      </div>
    </section>
  );
}
