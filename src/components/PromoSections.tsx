import cn from 'classnames';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { promoAssets } from '../data/homepage';
import './PromoSections.scss';

interface PromoCopy {
  title: string;
  text: string;
  cta: string;
}

export default function PromoSections() {
  const { t } = useTranslation();
  const items = t('home.promos', { returnObjects: true }) as PromoCopy[];

  return (
    <section className="promos">
      {promoAssets.map((asset, i) => {
        const promo = items[i];
        return (
          <article
            key={asset.id}
            className={cn('promo-row', { 'promo-row--reverse': asset.reverse })}
          >
            <div className="promo-row__media">
              <img src={asset.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            </div>
            <div className="promo-row__content">
              <div className="promo-row__inner">
                <h2>{promo.title}</h2>
                <p>{promo.text}</p>
                <Link to={asset.href} className="promo-row__link">
                  {promo.cta}
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
