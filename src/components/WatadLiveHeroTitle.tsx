import { useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { TextRotate } from '@/components/ui/text-rotate';
import '@/styles/tailwind.css';

type WatadLiveHeroTitleProps = {
  id?: string;
};

export default function WatadLiveHeroTitle({ id }: WatadLiveHeroTitleProps) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  const rotateTexts = t('live.heroTitleRotate', { returnObjects: true }) as string[];
  const isRtl = i18n.language?.startsWith('ar');

  if (reduceMotion) {
    return (
      <h1 id={id} className="live-hero__title">
        <span className="live-hero__title-row live-hero__title-row--static" dir="ltr">
          <span className="live-hero__title-brand">{t('live.heroTitlePrefix')}</span>
          <span className="live-hero__title-rotate live-hero__title-rotate--static">{rotateTexts[0]}</span>
        </span>
      </h1>
    );
  }

  return (
    <h1 id={id} className="live-hero__title">
      <span className="live-hero__title-row" dir="ltr" lang={isRtl ? 'ar' : 'en'}>
        <span className="live-hero__title-brand">{t('live.heroTitlePrefix')}</span>
        <TextRotate
          texts={rotateTexts}
          auto
          loop
          splitBy="words"
          rotationInterval={3000}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 420 }}
          mainClassName="live-hero__title-rotate"
          splitLevelClassName="live-hero__title-rotate-split"
          elementLevelClassName="live-hero__title-rotate-char"
        />
      </span>
    </h1>
  );
}
