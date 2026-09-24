import { useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { TextRotate } from '@/components/ui/text-rotate';
import '@/styles/tailwind.css';

type WatadLiveHeroTitleProps = {
  id?: string;
};

export default function WatadLiveHeroTitle({ id }: WatadLiveHeroTitleProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  const rotateTexts = t('live.heroTitleRotate', { returnObjects: true }) as string[];

  return (
    <h1 id={id} className="live-hero__title">
      <span className="live-hero__title-row">
        <span className="live-hero__title-brand">{t('live.heroTitlePrefix')}</span>
        <TextRotate
          texts={rotateTexts}
          auto={!reduceMotion}
          loop
          splitBy="characters"
          staggerFrom="last"
          staggerDuration={0.022}
          rotationInterval={2600}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-115%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          mainClassName="live-hero__title-rotate"
          splitLevelClassName="live-hero__title-rotate-split"
          elementLevelClassName="live-hero__title-rotate-char"
        />
      </span>
    </h1>
  );
}
