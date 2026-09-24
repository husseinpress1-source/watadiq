import { Link } from 'react-router-dom';
import { PORTFOLIO_PROJECTS } from '../data/portfolio';
import './WorkPageHero.scss';

interface WorkPageHeroProps {
  eyebrow?: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
}

export default function WorkPageHero({ eyebrow, title, intro, cta }: WorkPageHeroProps) {
  return (
    <section className="work-hero" aria-labelledby="work-hero-title">
      <div className="work-hero__inner">
        <div className="work-hero__copy">
          {eyebrow && <p className="work-hero__eyebrow">{eyebrow}</p>}
          <h1 id="work-hero-title">{title}</h1>
          <p className="work-hero__intro">{intro}</p>
          {cta && (
            <Link to={cta.href} className="work-hero__cta">
              {cta.label}
            </Link>
          )}
        </div>

        <div className="work-hero__previews" aria-hidden>
          {PORTFOLIO_PROJECTS.map((project) => (
            <a
              key={project.id}
              href={project.url}
              className="work-hero__preview"
              target="_blank"
              rel="noreferrer"
              tabIndex={-1}
            >
              <img src={project.screenshot} alt="" loading="lazy" decoding="async" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
