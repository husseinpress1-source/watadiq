import { Link } from 'react-router-dom';
import './PageHero.scss';

interface PageHeroProps {
  image: string;
  eyebrow?: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
}

export default function PageHero({ image, eyebrow, title, intro, cta }: PageHeroProps) {
  return (
    <section className="page-hero">
      <img
        className="page-hero__bg"
        src={image}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className="page-hero__overlay" aria-hidden="true" />
      <div className="page-hero__content">
        {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="page-hero__intro">{intro}</p>
        {cta && (
          <Link to={cta.href} className="page-hero__cta">
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
