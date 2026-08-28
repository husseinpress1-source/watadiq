import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import './HorizontalScroll.scss';

interface HorizontalScrollProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  trackRef?: RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
}

export default function HorizontalScroll({
  children,
  ariaLabel,
  className = '',
  trackRef: externalTrackRef,
  onScroll,
}: HorizontalScrollProps) {
  const internalTrackRef = useRef<HTMLDivElement>(null);
  const trackRef = externalTrackRef ?? internalTrackRef;

  function scrollBy(direction: 'left' | 'right') {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.scroll-card');
    const amount = card ? card.offsetWidth + 12 : track.clientWidth * 0.85;
    const isRtl = document.documentElement.dir === 'rtl';
    const delta = direction === 'left' ? -amount : amount;
    track.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
  }

  return (
    <div className={`horizontal-scroll ${className}`}>
      <button
        type="button"
        className="horizontal-scroll__arrow horizontal-scroll__arrow--prev"
        onClick={() => scrollBy('left')}
        aria-label="Scroll left"
      />

      <div
        className="horizontal-scroll__track"
        ref={trackRef}
        aria-label={ariaLabel}
        onScroll={onScroll}
      >
        {children}
      </div>

      <button
        type="button"
        className="horizontal-scroll__arrow horizontal-scroll__arrow--next"
        onClick={() => scrollBy('right')}
        aria-label="Scroll right"
      />
    </div>
  );
}
