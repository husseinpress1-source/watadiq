import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './FeaturedBookSection.scss';

export default function FeaturedBookSection() {
  const { t } = useTranslation();

  return (
    <section className="featured-book" aria-labelledby="featured-book-title">
      <div className="featured-book__inner">
        <div className="featured-book__media">
          <img
            src="/images/home/featured-company.png"
            alt="WATAD Iraqi software team"
            loading="lazy"
          />
        </div>

        <div className="featured-book__content">
          <p className="featured-book__eyebrow">{t('home.featuredEyebrow')}</p>
          <h2 id="featured-book-title">{t('home.featuredTitle')}</h2>
          <p>{t('home.featuredText')}</p>
          <Link to="/about" className="featured-book__cta">
            {t('home.featuredCta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
