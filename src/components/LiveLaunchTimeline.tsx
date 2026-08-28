import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import './LiveLaunchTimeline.scss';

const ease = [0.22, 1, 0.36, 1] as const;

type TimelineStatus = 'done' | 'active' | 'upcoming';

type TimelineStep = {
  phase: string;
  status: TimelineStatus;
  detail: string;
};

function StepIcon({ status }: { status: TimelineStatus }) {
  if (status === 'done') {
    return (
      <svg className="live-launch__icon live-launch__icon--done" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'active') {
    return <span className="live-launch__icon live-launch__icon--active" aria-hidden="true" />;
  }

  return <span className="live-launch__icon live-launch__icon--upcoming" aria-hidden="true" />;
}

export default function LiveLaunchTimeline() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  const timeline = t('live.timeline', { returnObjects: true }) as TimelineStep[];

  const doneCount = timeline.filter((step) => step.status === 'done').length;
  const activeIndex = timeline.findIndex((step) => step.status === 'active');
  const progress =
    activeIndex >= 0
      ? (activeIndex + 0.5) / Math.max(timeline.length - 1, 1)
      : doneCount === timeline.length
        ? 1
        : doneCount / Math.max(timeline.length - 1, 1);

  const fade: Variants = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
      };

  const list: Variants = {
    hidden: {},
    show: {
      transition: reduceMotion ? {} : { staggerChildren: 0.08 },
    },
  };

  return (
    <section className="live-launch" aria-labelledby="live-launch-title">
      <div className="live-launch__inner">
        <motion.header
          className="live-launch__head"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="live-launch__eyebrow">{t('live.launchEyebrow')}</p>
          <h2 id="live-launch-title">{t('live.launchTitle')}</h2>
          <p className="live-launch__intro">{t('live.launchIntro')}</p>
        </motion.header>

        <div className="live-launch__track" aria-hidden="true">
          <div className="live-launch__track-line">
            <span className="live-launch__track-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>

        <motion.ol
          className="live-launch__steps"
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {timeline.map((step, index) => {
            const stepNumber = String(index + 1).padStart(2, '0');

            return (
              <motion.li
                key={step.phase}
                className={`live-launch__step live-launch__step--${step.status}`}
                variants={fade}
              >
                <div className="live-launch__marker" aria-hidden="true">
                  <span className="live-launch__node">
                    <StepIcon status={step.status} />
                  </span>
                </div>

                <article className="live-launch__card">
                  <div className="live-launch__card-top">
                    <span className="live-launch__index">{stepNumber}</span>
                    <span className={`live-launch__badge live-launch__badge--${step.status}`}>
                      {t(`live.timelineStatus.${step.status}`)}
                    </span>
                  </div>
                  <h3>{step.phase}</h3>
                  <p>{step.detail}</p>
                </article>
              </motion.li>
            );
          })}
        </motion.ol>

        <motion.footer
          className="live-launch__foot"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <p>{t('live.launchFootnote')}</p>
        </motion.footer>
      </div>
    </section>
  );
}
