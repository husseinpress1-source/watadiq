import { useEffect, useRef } from 'react';
import cn from 'classnames';
import { collections } from '../data/collections';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { animateCards } from '../lib/plugins';
import './BrowseArt.scss';

export default function BrowseArt() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: headingRef, isVisible } = useIntersectionObserver<HTMLHeadingElement>();

  useEffect(() => {
    if (isVisible && sectionRef.current) {
      animateCards('.art-card');
    }
  }, [isVisible]);

  return (
    <section className="browse-art" ref={sectionRef} id="art">
      <h2 className="browse-art__title" ref={headingRef}>
        Browse the Art
      </h2>

      <div className="browse-art__grid">
        {collections.map((item) => (
          <a
            key={item.id}
            href={`#${item.slug}`}
            className={cn('art-card', { 'art-card--visible': isVisible })}
            data-fancybox="collections"
            data-src={item.image}
            data-caption={item.title}
          >
            <div className="art-card__image-wrap">
              <img
                className="art-card__image"
                src={item.image}
                loading="lazy"
                alt={item.title}
              />
            </div>
            <h3 className="art-card__title">{item.title}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
