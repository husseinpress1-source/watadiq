import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react';
import './LiveLaunchTimeline.scss';

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: 'spring' as const, stiffness: 120, damping: 22, mass: 0.85 };

type TimelineStatus = 'done' | 'active' | 'upcoming';

type TimelineStep = {
  phase: string;
  status: TimelineStatus;
  detail: string;
};

function LaunchStepIcon({ status, reduceMotion }: { status: TimelineStatus; reduceMotion: boolean }) {
  if (status === 'done') {
    return (
      <svg className="live-launch__icon live-launch__icon--done" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.15 }}
        />
      </svg>
    );
  }

  if (status === 'active') {
    return (
      <span className="live-launch__icon live-launch__icon--active" aria-hidden="true">
        <motion.span
          className="live-launch__icon-core"
          animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
    );
  }

  return <span className="live-launch__icon live-launch__icon--upcoming" aria-hidden="true" />;
}

function LaunchStepCard({
  step,
  index,
  total,
  statusLabel,
  reduceMotion,
}: {
  step: TimelineStep;
  index: number;
  total: number;
  statusLabel: string;
  reduceMotion: boolean;
}) {
  const stepNumber = String(index + 1).padStart(2, '0');

  const cardVariants: Variants = reduceMotion
    ? {}
    : {
        hidden: {
          opacity: 0,
          y: 36,
          scale: 0.96,
          filter: 'blur(6px)',
        },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration: 0.65,
            ease,
            delay: index * 0.14,
          },
        },
      };

  const contentVariants: Variants = reduceMotion
    ? {}
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.07, delayChildren: 0.12 + index * 0.1 },
        },
      };

  const lineVariants: Variants = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
      };

  return (
    <motion.li
      className={`live-launch__step live-launch__step--${step.status}`}
      variants={cardVariants}
      style={{ zIndex: total - index }}
    >
      <div className="live-launch__step-rail" aria-hidden="true">
        <motion.span
          className="live-launch__step-node"
          initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.08 + index * 0.12 }}
        >
          <LaunchStepIcon status={step.status} reduceMotion={reduceMotion} />
        </motion.span>

        {step.status === 'active' && !reduceMotion && (
          <motion.span
            className="live-launch__step-ring"
            aria-hidden="true"
            animate={{ scale: [1, 1.7], opacity: [0.35, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {index < total - 1 && (
          <motion.span
            className="live-launch__step-connector"
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease, delay: 0.25 + index * 0.14 }}
          />
        )}
      </div>

      <motion.article
        className="live-launch__card"
        variants={contentVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-20px' }}
      >
        <motion.div className="live-launch__card-top" variants={lineVariants}>
          <span className="live-launch__index">{stepNumber}</span>
          <motion.span
            className={`live-launch__badge live-launch__badge--${step.status}`}
            layout
            transition={spring}
          >
            {statusLabel}
          </motion.span>
        </motion.div>

        <motion.h3 variants={lineVariants}>{step.phase}</motion.h3>
        <motion.p variants={lineVariants}>{step.detail}</motion.p>

        {step.status === 'active' && (
          <motion.div
            className="live-launch__card-bar"
            aria-hidden="true"
            initial={reduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease, delay: 0.2 + index * 0.1 }}
          />
        )}
      </motion.article>
    </motion.li>
  );
}

export default function LiveLaunchTimeline() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const timeline = t('live.timeline', { returnObjects: true }) as TimelineStep[];

  const activeIndex = timeline.findIndex((step) => step.status === 'active');
  const doneCount = timeline.filter((step) => step.status === 'done').length;
  const targetProgress =
    activeIndex >= 0
      ? (activeIndex + 0.62) / Math.max(timeline.length - 1, 1)
      : doneCount === timeline.length
        ? 1
        : doneCount / Math.max(timeline.length - 1, 1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'end 0.35'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  const barScale = useTransform(smoothProgress, [0, 1], [0, targetProgress]);
  const barOpacity = useTransform(smoothProgress, [0, 0.08], [0.2, 1]);
  const headlineY = useTransform(smoothProgress, [0, 1], [24, 0]);
  const headlineOpacity = useTransform(smoothProgress, [0, 0.35], [0.55, 1]);

  const listVariants: Variants = {
    hidden: {},
    show: {
      transition: reduceMotion ? {} : { staggerChildren: 0.1, delayChildren: 0.06 },
    },
  };

  return (
    <section ref={sectionRef} className="live-launch" aria-labelledby="live-launch-title">
      <div className="live-launch__bg" aria-hidden="true">
        <div className="live-launch__grid" />
      </div>

      <div className="live-launch__inner">
        <motion.header
          className="live-launch__head"
          style={reduceMotion ? undefined : { y: headlineY, opacity: headlineOpacity }}
        >
          <motion.p
            className="live-launch__eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, ease }}
          >
            {t('live.launchEyebrow')}
          </motion.p>

          <motion.h2
            id="live-launch-title"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
          >
            {t('live.launchTitle')}
          </motion.h2>

          <motion.p
            className="live-launch__intro"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
          >
            {t('live.launchIntro')}
          </motion.p>
        </motion.header>

        <div className="live-launch__meter" aria-hidden="true">
          <div className="live-launch__meter-track">
            <motion.span
              className="live-launch__meter-fill"
              style={reduceMotion ? { scaleX: targetProgress } : { scaleX: barScale, opacity: barOpacity }}
            />
          </div>
          <div className="live-launch__meter-labels">
            {timeline.map((step, index) => (
              <span
                key={step.phase}
                className={`live-launch__meter-label live-launch__meter-label--${step.status}`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>

        <motion.ol
          className="live-launch__steps"
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {timeline.map((step, index) => (
            <LaunchStepCard
              key={step.phase}
              step={step}
              index={index}
              total={timeline.length}
              statusLabel={t(`live.timelineStatus.${step.status}`)}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.ol>

        <motion.footer
          className="live-launch__foot"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease, delay: 0.2 }}
        >
          <span className="live-launch__foot-dot" aria-hidden="true" />
          <p>{t('live.launchFootnote')}</p>
        </motion.footer>
      </div>
    </section>
  );
}
