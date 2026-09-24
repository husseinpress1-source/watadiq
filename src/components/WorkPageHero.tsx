import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PORTFOLIO_PROJECTS } from '../data/portfolio';
import MotionProjectDeck from './MotionProjectDeck';
import './WorkPageHero.scss';

interface WorkPageHeroProps {
  eyebrow?: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
}

export default function WorkPageHero({ eyebrow, title, intro, cta }: WorkPageHeroProps) {
  const { t } = useTranslation();

  const deckItems = PORTFOLIO_PROJECTS.map((project) => ({
    id: project.id,
    image: project.screenshot,
    alt: t(`portfolio.projects.${project.i18nKey}.title`),
  }));

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

        <div className="work-hero__showcase">
          <MotionProjectDeck items={deckItems} hint={t('portfolio.deckHint')} />
        </div>
      </div>
    </section>
  );
}
