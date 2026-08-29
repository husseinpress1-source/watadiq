import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PricingPlan } from '../data/watad-pages';
import { Pricing } from '@/components/ui/pricing';
import { findWatadPlanByName, getNumberLocale, mapWatadPlansToUi } from '@/lib/pricing-ui';
import PlanInquiryModal from './PlanInquiryModal';
import PricingComparison from './PricingComparison';
import './PricingCards.scss';
import '@/styles/tailwind.css';

interface PricingCardsProps {
  plans: PricingPlan[];
  sectionTitle?: string;
}

export default function PricingCards({ plans, sectionTitle }: PricingCardsProps) {
  const { t, i18n } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const numberLocale = getNumberLocale(i18n.language);
  const uiPlans = mapWatadPlansToUi(plans, { currencyLabel: t('pricingUi.currencyLabel') });

  function handlePlanAction(planName: string) {
    setSelectedPlan(findWatadPlanByName(plans, planName));
  }

  function handleCloseModal() {
    setSelectedPlan(null);
  }

  return (
    <>
      <div className="watad-pricing-ui pricing-cards-shell">
        <Pricing
          plans={uiPlans}
          title={sectionTitle ?? t('pricingUi.title')}
          description={t('pricingUi.description')}
          fullPaymentLabel={t('pricingUi.fullPaymentLabel')}
          splitPaymentLabel={t('pricingUi.splitPaymentLabel')}
          splitBadge={t('pricingUi.splitBadge')}
          billedFullLabel={t('pricingUi.billedFullLabel')}
          billedSplitLabel={t('pricingUi.billedSplitLabel')}
          splitTotalLabel={t('pricingUi.splitTotalLabel')}
          popularLabel={t('pricingUi.popularLabel')}
          toggleHint={t('pricingUi.toggleHint')}
          toggleAriaLabel={t('pricingUi.toggleAriaLabel')}
          perProjectLabel={t('pricingUi.perProjectLabel')}
          locale={numberLocale}
          onPlanAction={(plan) => handlePlanAction(plan.name)}
        />
        <PricingComparison planNames={uiPlans.map((plan) => plan.name)} />
      </div>

      <PlanInquiryModal plan={selectedPlan} onClose={handleCloseModal} />
    </>
  );
}
