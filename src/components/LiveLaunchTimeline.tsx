import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import './LiveLaunchTimeline.scss';

const easeOut = [0.22, 1, 0.36, 1] as const;

type TimelineStatus = 'done' | 'active' | 'upcoming';

type TimelineStep = {
  phase: string;
  status: TimelineStatus;
  detail: string;
};

function splitTitleWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function ProgressPercent({
  progress,
  reduceMotion,
  inView,
}: {
  progress: number;
  reduceMotion: boolean;
  inView: boolean;
}) {
  const target = Math.round(progress * 100);
  const [display, setDisplay] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(target);
      return;
    }

    let frame = 0;
    const duration = 700;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, target]);

  return <span className="live-launch__percent">{display}%</span>;
}

export default function LiveLaunchTimeline() {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const timeline = t('live.timeline', { returnObjects: true }) as TimelineStep[];
  const titleWords = useMemo(
    () => splitTitleWords(t('live.launchTitle')),
    [t, i18n.language],
  );

  const doneCount = timeline.filter((step) => step.status === 'done').length;
  const activeIndex = timeline.findIndex((step) => step.status === 'active');
  const progress =
    activeIndex >= 0
      ? (activeIndex + 0.5) / Math.max(timeline.length - 1, 1)
      : doneCount === timeline.length
        ? 1
        : doneCount / Math.max(timeline.length - 1, 1);

  const headVariants: Variants = reduceMotion
    ? {}
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
      };

  const fadeUp: Variants = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
      };

  const titleWord: Variants = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: '100%' },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: easeOut },
        },
      };

  const panelVariants: Variants = {
    hidden: {},
    show: {
      transition: reduceMotion ? {} : { staggerChildren: 0.1, delayChildren: 0.12 },
    },
  };

  const panelItem: Variants = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: easeOut },
        },
      };

  return (
    <section ref={sectionRef} className="live-launch" aria-labelledby="live-launch-title">
      <div className="live-launch__inner">
        <div className="live-launch__layout">
          <motion.aside
            className="live-launch__hero"
            variants={headVariants}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
          >
            <motion.p className="live-launch__eyebrow" variants={fadeUp}>
              {t('live.launchEyebrow')}
            </motion.p>

            <h2 id="live-launch-title" className="live-launch__title" aria-label={t('live.launchTitle')}>
              {titleWords.map((word, index) => (
                <span key={`${word}-${index}`} className="live-launch__title-word-wrap" aria-hidden="true">
                  <motion.span className="live-launch__title-word" variants={titleWord}>
                    {word}
                  </motion.span>
                  {index < titleWords.length - 1 ? ' ' : null}
                </span>
              ))}
            </h2>

            <motion.p className="live-launch__intro" variants={fadeUp}>
              {t('live.launchIntro')}
            </motion.p>

            <motion.div
              className="live-launch__meter"
              variants={fadeUp}
              aria-label={`${t('live.progressLabel')}: ${Math.round(progress * 100)}%`}
            >
              <div className="live-launch__meter-head">
                <p className="live-launch__meter-label">{t('live.progressLabel')}</p>
                <ProgressPercent progress={progress} reduceMotion={reduceMotion} inView={isInView} />
              </div>
              <div className="live-launch__meter-bar">
                <motion.span
                  className="live-launch__meter-fill"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={isInView ? { scaleX: progress } : { scaleX: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: easeOut, delay: 0.15 }}
                />
              </div>
              <p className="live-launch__meter-meta">
                {doneCount}/{timeline.length} {t('live.launchEyebrow').toLowerCase()}
              </p>
            </motion.div>
          </motion.aside>

          <motion.div
            className="live-launch__panels"
            variants={panelVariants}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            role="list"
          >
            {timeline.map((step, index) => {
              const stepNumber = String(index + 1).padStart(2, '0');

              return (
                <motion.article
                  key={step.phase}
                  className={`live-launch__panel live-launch__panel--${step.status}`}
                  variants={panelItem}
                  role="listitem"
                >
                  <span className="live-launch__panel-index" aria-hidden="true">
                    {stepNumber}
                  </span>

                  <div className="live-launch__panel-main">
                    <div className="live-launch__panel-top">
                      <h3>{step.phase}</h3>
                      <span className={`live-launch__status live-launch__status--${step.status}`}>
                        {t(`live.timelineStatus.${step.status}`)}
                      </span>
                    </div>
                    <p>{step.detail}</p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        <motion.footer
          className="live-launch__foot"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <p>{t('live.launchFootnote')}</p>
        </motion.footer>
      </div>
    </section>
  );
}
