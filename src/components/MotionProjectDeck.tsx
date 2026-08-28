import { useEffect, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type PanInfo,
  type Transition,
} from 'motion/react';
import './MotionProjectDeck.scss';

export interface DeckItem {
  id: string;
  image: string;
  alt?: string;
}

interface MotionProjectDeckProps {
  items: DeckItem[];
  hint?: string;
  className?: string;
  onActiveChange?: (itemId: string) => void;
}

const springSnap: Transition = { type: 'spring', stiffness: 520, damping: 38, mass: 0.65 };
const springSoft: Transition = { type: 'spring', stiffness: 380, damping: 32 };

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
}

function wrapOffset(diff: number, total: number) {
  if (total <= 1) return diff;
  if (diff > total / 2) return diff - total;
  if (diff < -total / 2) return diff + total;
  return diff;
}

interface DeckCardProps {
  item: DeckItem;
  offset: number;
  dragX: MotionValue<number>;
  spread: number;
  isMobile: boolean;
  reduceMotion: boolean;
}

function DeckCard({ item, offset, dragX, spread, isMobile, reduceMotion }: DeckCardProps) {
  const combined = useTransform(dragX, (value) => offset + value / (isMobile ? 260 : 320));
  const x = useTransform(combined, (value) => value * spread);
  const rotateY = useTransform(combined, (value) => value * (isMobile ? -24 : -30));
  const scale = useTransform(combined, (value) => Math.max(0.7, 1 - Math.abs(value) * 0.16));
  const z = useTransform(combined, (value) => -Math.abs(value) * (isMobile ? 90 : 120));
  const opacity = useTransform(combined, (value) => Math.max(0.12, 1 - Math.abs(value) * 0.45));
  const blur = useTransform(combined, (value) =>
    reduceMotion ? 0 : Math.max(0, Math.abs(value) * 1.6),
  );
  const zIndex = useTransform(combined, (value) => Math.round(20 - Math.abs(value) * 10));
  const filter = useTransform(blur, (value) =>
    value > 0.2 ? `blur(${value}px) saturate(0.92)` : 'none',
  );

  return (
    <motion.div
      className="motion-deck__card"
      style={{ x, rotateY, scale, z, opacity, zIndex, filter }}
    >
      <div className="motion-deck__frame">
        <img src={item.image} alt={item.alt ?? ''} className="motion-deck__image" draggable={false} />
        <div className="motion-deck__shine" aria-hidden="true" />
        <div className="motion-deck__edge" aria-hidden="true" />
      </div>
    </motion.div>
  );
}

export default function MotionProjectDeck({
  items,
  hint,
  className,
  onActiveChange,
}: MotionProjectDeckProps) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const dragX = useMotionValue(0);
  const springX = useSpring(dragX, { stiffness: 620, damping: 44, mass: 0.48 });
  const spread = isMobile ? 100 : 128;

  useEffect(() => {
    onActiveChange?.(items[index]?.id ?? items[0]?.id);
  }, [index, items, onActiveChange]);

  const goTo = (next: number) => {
    setIndex(Math.max(0, Math.min(items.length - 1, next)));
  };

  const onDragEnd = (_event: PointerEvent, info: PanInfo) => {
    const threshold = isMobile ? 52 : 76;
    const velocityGate = isMobile ? 360 : 500;

    if (info.offset.x <= -threshold || info.velocity.x <= -velocityGate) {
      goTo(index + 1);
    } else if (info.offset.x >= threshold || info.velocity.x >= velocityGate) {
      goTo(index - 1);
    }

    animate(dragX, 0, springSnap);
  };

  return (
    <div className={`motion-deck${className ? ` ${className}` : ''}${isMobile ? ' motion-deck--mobile' : ''}`}>
      {hint && (
        <motion.p
          className="motion-deck__hint"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springSoft }}
        >
          {hint}
        </motion.p>
      )}

      <div className="motion-deck__viewport">
        <motion.div
          className="motion-deck__glow"
          aria-hidden="true"
          animate={{
            opacity: [0.45, 0.72, 0.45],
            scale: [0.92, 1.04, 0.92],
          }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="motion-deck__stage">
          {items.map((item, itemIndex) => {
            const offset = wrapOffset(itemIndex - index, items.length);
            if (Math.abs(offset) > 1.5) return null;

            return (
              <DeckCard
                key={item.id}
                item={item}
                offset={offset}
                dragX={springX}
                spread={spread}
                isMobile={isMobile}
                reduceMotion={reduceMotion ?? false}
              />
            );
          })}

          <motion.div
            className="motion-deck__drag-layer"
            drag={reduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragMomentum={false}
            onDrag={(_event, info) => dragX.set(info.offset.x)}
            onDragEnd={onDragEnd}
            whileDrag={{ cursor: 'grabbing' }}
          />
        </div>

        {!isMobile && items.length > 1 && (
          <div className="motion-deck__nav">
            <button
              type="button"
              className="motion-deck__nav-btn"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              className="motion-deck__nav-btn"
              disabled={index === items.length - 1}
              onClick={() => goTo(index + 1)}
              aria-label="Next"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="motion-deck__footer">
        <div className="motion-deck__dots" role="tablist" aria-label="Projects">
          {items.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              className={`motion-deck__dot${dotIndex === index ? ' is-active' : ''}`}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
        <div className="motion-deck__progress-track" aria-hidden="true">
          <motion.div
            className="motion-deck__progress"
            initial={false}
            animate={{ scaleX: (index + 1) / items.length }}
            transition={springSnap}
          />
        </div>
      </div>
    </div>
  );
}
