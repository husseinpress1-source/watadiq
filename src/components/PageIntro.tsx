import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import './PageIntro.scss';

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  heroImage?: string;
  heroImageMobile?: string;
  heroImageAlt?: string;
}

function IntroLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: string;
}) {
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export default function PageIntro({
  eyebrow,
  title,
  intro,
  cta,
  ctaSecondary,
  heroImage,
  heroImageMobile,
  heroImageAlt,
}: PageIntroProps) {
  const hasActions = Boolean(cta || ctaSecondary);
  const reduceMotion = useReducedMotion() ?? false;
  const hasVisual = Boolean(heroImage);

  const copyMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: hasVisual ? 0.06 : 0 },
      };

  const visualMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <header className={`page-intro${hasVisual ? ' page-intro--visual' : ''}`}>
      <div className="page-intro__shell">
        {hasVisual && (
          <motion.div className="page-intro__visual" {...visualMotion}>
            <div className="page-intro__visual-frame">
              <picture>
                {heroImageMobile && (
                  <source media="(max-width: 960px)" srcSet={heroImageMobile} />
                )}
                <img
                  src={heroImage}
                  alt={heroImageAlt ?? ''}
                  className="page-intro__visual-image"
                  width={640}
                  height={480}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </picture>
            </div>
          </motion.div>
        )}

        <motion.div className="page-intro__copy" {...copyMotion}>
          {eyebrow && <p className="page-intro__eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          <p className="page-intro__lead">{intro}</p>
          {hasActions && (
            <div className="page-intro__actions">
              {cta && (
                <IntroLink href={cta.href} className="page-intro__cta page-intro__cta--primary">
                  {cta.label}
                </IntroLink>
              )}
              {ctaSecondary && (
                <IntroLink href={ctaSecondary.href} className="page-intro__cta page-intro__cta--ghost">
                  {ctaSecondary.label}
                </IntroLink>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}
