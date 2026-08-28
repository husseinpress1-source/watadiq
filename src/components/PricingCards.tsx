import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PricingPlan } from '../data/watad-pages';
import { getPricingTier } from '../data/pricing-assets';
import HorizontalScroll from './HorizontalScroll';
import PlanInquiryModal from './PlanInquiryModal';
import './PricingCards.scss';

interface PricingCardsProps {
  plans: PricingPlan[];
}

interface PricingCardProps {
  plan: PricingPlan;
  badgeFallback: string;
  className?: string;
  isSelected?: boolean;
  onSelectPlan: (plan: PricingPlan) => void;
}

function PricingCard({
  plan,
  badgeFallback,
  className = '',
  isSelected = false,
  onSelectPlan,
}: PricingCardProps) {
  const tier = getPricingTier(plan);

  return (
    <article
      className={`pricing-card pricing-card--${tier}${plan.featured ? ' pricing-card--featured' : ''}${isSelected ? ' pricing-card--selected' : ''} ${className}`.trim()}
    >
      <div className="pricing-card__sticky">
        <div className="pricing-card__badge-row">
          {plan.featured ? (
            <span className="pricing-card__badge">{plan.badge ?? badgeFallback}</span>
          ) : (
            <span className="pricing-card__badge-spacer" aria-hidden="true" />
          )}
        </div>

        <h3 className="pricing-card__name">{plan.name}</h3>
        <p className="pricing-card__desc">{plan.description}</p>

        <div className="pricing-card__price">
          <span className="pricing-card__amount">{plan.price}</span>
          <span className="pricing-card__meta">
            {plan.currency}
            {plan.period ? ` ${plan.period}` : ''}
          </span>
        </div>

        <button type="button" className="pricing-card__cta" onClick={() => onSelectPlan(plan)}>
          {plan.cta.label}
        </button>
      </div>

      <div className="pricing-card__content">
        {plan.features && plan.features.length > 0 && (
          <ul className="pricing-card__features">
            {plan.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        <p className={`pricing-card__note${plan.note ? '' : ' pricing-card__note--empty'}`}>
          {plan.note ?? '\u00a0'}
        </p>
      </div>
    </article>
  );
}

export default function PricingCards({ plans }: PricingCardsProps) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [activeMobilePlan, setActiveMobilePlan] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  function handleSelectPlan(plan: PricingPlan) {
    setSelectedPlan(plan);
  }

  function handleCloseModal() {
    setSelectedPlan(null);
  }

  const scrollToMobilePlan = useCallback((index: number) => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    setActiveMobilePlan(index);
    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, []);

  const syncActiveMobilePlan = useCallback(() => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    if (cards.length === 0) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveMobilePlan(closestIndex);
  }, []);

  return (
    <>
      <div className="pricing-cards-shell">
        <div className="pricing-cards pricing-cards--desktop">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              badgeFallback={t('common.specialOffer')}
              isSelected={selectedPlan?.name === plan.name}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        <div className="pricing-cards pricing-cards--mobile">
          <div className="pricing-cards__tabs" role="tablist" aria-label={t('common.packages')}>
            {plans.map((plan, index) => (
              <button
                key={plan.name}
                type="button"
                role="tab"
                className={`pricing-cards__tab${activeMobilePlan === index ? ' is-active' : ''}${plan.featured ? ' is-featured' : ''}`}
                aria-selected={activeMobilePlan === index}
                onClick={() => scrollToMobilePlan(index)}
              >
                {plan.name}
              </button>
            ))}
          </div>

          <HorizontalScroll
            ariaLabel={t('common.pricingCarousel')}
            className="pricing-cards__scroll"
            trackRef={mobileTrackRef}
            onScroll={syncActiveMobilePlan}
          >
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                badgeFallback={t('common.specialOffer')}
                className="scroll-card"
                isSelected={selectedPlan?.name === plan.name}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </HorizontalScroll>

          <p className="pricing-cards__swipe-hint">{t('common.swipePlans')}</p>
        </div>
      </div>

      <PlanInquiryModal plan={selectedPlan} onClose={handleCloseModal} />
    </>
  );
}
