import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { Check, Star } from 'lucide-react';

import HorizontalScroll from '@/components/HorizontalScroll';
import { cn } from '@/lib/utils';
import { formatPriceAmount } from '@/lib/pricing-ui';

export interface PricingPlan {
  name: string;
  price: string;
  installmentPrice: string;
  period: string;
  currency: string;
  features: string[];
  description: string;
  note?: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  priceSuffix?: string;
}

export interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  fullPaymentLabel?: string;
  splitPaymentLabel?: string;
  splitBadge?: string;
  billedFullLabel?: string;
  billedSplitLabel?: string;
  splitTotalLabel?: string;
  popularLabel?: string;
  toggleHint?: string;
  toggleAriaLabel?: string;
  perProjectLabel?: string;
  swipeHint?: string;
  packagesLabel?: string;
  locale?: string;
  onPlanAction?: (plan: PricingPlan, index: number) => void;
}

export function formatPlanAmount(rawPrice: string) {
  const suffix = rawPrice.includes('+') ? '+' : '';
  const numeric = Number(rawPrice.replace(/[^\d]/g, ''));
  return { numeric, suffix };
}

function formatGrouped(value: number, locale: string) {
  return formatPriceAmount(value, locale);
}

function PricingPlanCard({
  plan,
  index,
  isFullPayment,
  locale,
  perProjectLabel,
  billedFullLabel,
  billedSplitLabel,
  splitTotalLabel,
  popularLabel,
  onPlanAction,
  className,
}: {
  plan: PricingPlan;
  index: number;
  isFullPayment: boolean;
  locale: string;
  perProjectLabel: string;
  billedFullLabel: string;
  billedSplitLabel: string;
  splitTotalLabel: string;
  popularLabel: string;
  onPlanAction?: (plan: PricingPlan, index: number) => void;
  className?: string;
}) {
  const fullAmount = Number(plan.price);
  const installmentAmount = Number(plan.installmentPrice);
  const displayAmount = isFullPayment ? fullAmount : installmentAmount;

  const ctaClassName = cn('pricing-ui-card__cta', plan.isPopular && 'pricing-ui-card__cta--featured');

  return (
    <article className={cn('pricing-ui-card', plan.isPopular && 'pricing-ui-card--featured', className)}>
      <div className="pricing-ui-card__badge-row">
        {plan.isPopular ? (
          <span className="pricing-ui-card__badge">
            <Star aria-hidden="true" />
            {popularLabel}
          </span>
        ) : (
          <span className="pricing-ui-card__badge-spacer" aria-hidden="true" />
        )}
      </div>

      <p className="pricing-ui-card__name">{plan.name}</p>

      <div className="pricing-ui-card__price">
        <div className="pricing-ui-card__price-island" dir="ltr" lang={locale.startsWith('ar') ? 'ar' : 'en'}>
          <div className="pricing-ui-card__amount-row">
            <span className="pricing-ui-card__amount">
              <NumberFlow
                value={displayAmount}
                locales={locale}
                format={{
                  style: 'decimal',
                  useGrouping: true,
                  maximumFractionDigits: 0,
                }}
                transformTiming={{ duration: 450, easing: 'ease-out' }}
                willChange
              />
            </span>
            {plan.priceSuffix && isFullPayment ? (
              <span className="pricing-ui-card__suffix">{plan.priceSuffix}</span>
            ) : null}
            <span className="pricing-ui-card__currency">{plan.currency}</span>
          </div>
        </div>

        <p className="pricing-ui-card__period">{perProjectLabel}</p>
        <p className="pricing-ui-card__billing">{isFullPayment ? billedFullLabel : billedSplitLabel}</p>
        <p className={cn('pricing-ui-card__total', !isFullPayment && 'is-visible')}>
          <span className="pricing-ui-card__total-label">{splitTotalLabel}</span>
          <span className="pricing-ui-card__total-value" dir="ltr" lang={locale.startsWith('ar') ? 'ar' : 'en'}>
            {formatGrouped(fullAmount, locale)}
            {plan.priceSuffix ?? ''} {plan.currency}
          </span>
        </p>
      </div>

      <ul className="pricing-ui-card__features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="pricing-ui-card__footer">
        {onPlanAction ? (
          <button type="button" className={ctaClassName} onClick={() => onPlanAction(plan, index)}>
            {plan.buttonText}
          </button>
        ) : (
          <Link to={plan.href} className={ctaClassName}>
            {plan.buttonText}
          </Link>
        )}

        <p className="pricing-ui-card__desc">{plan.description}</p>
        <p className={cn('pricing-ui-card__note', plan.note && plan.isPopular && 'is-visible')}>
          {plan.note ?? '\u00a0'}
        </p>
      </div>
    </article>
  );
}

export function Pricing({
  plans,
  title = 'Simple, Transparent Pricing',
  description = 'Choose the plan that works for you.\nAll plans include access to our platform, lead generation tools, and dedicated support.',
  fullPaymentLabel = 'Full payment',
  splitPaymentLabel = '50-50 split',
  splitBadge = '(2 milestones)',
  billedFullLabel = 'total project fee',
  billedSplitLabel = 'per milestone payment',
  splitTotalLabel = 'Total',
  popularLabel = 'Popular',
  toggleHint = 'Choose how you pay. With 50-50 split, you pay half to start and half before launch.',
  toggleAriaLabel = 'Payment method',
  perProjectLabel = 'per project',
  swipeHint = 'Swipe left or right to compare plans',
  packagesLabel = 'Packages',
  locale = 'en-IQ',
  onPlanAction,
}: PricingProps) {
  const [isFullPayment, setIsFullPayment] = useState(true);
  const [activeMobilePlan, setActiveMobilePlan] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  const selectFullPayment = () => {
    setIsFullPayment(true);
  };

  const selectSplitPayment = (event: MouseEvent<HTMLButtonElement>) => {
    if (isFullPayment) {
      const rect = event.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 36,
        spread: 48,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#e4002b', '#1a1a1a', '#ffffff', '#666666'],
        ticks: 160,
        gravity: 1.1,
        decay: 0.94,
        startVelocity: 24,
        shapes: ['circle'],
      });
    }
    setIsFullPayment(false);
  };

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

  const cardProps = {
    isFullPayment,
    locale,
    perProjectLabel,
    billedFullLabel,
    billedSplitLabel,
    splitTotalLabel,
    popularLabel,
    onPlanAction,
  };

  return (
    <div className="pricing-ui">
      <div className="pricing-ui__head">
        <h2 className="pricing-ui__title">{title}</h2>
        <p className="pricing-ui__lead">{description}</p>
      </div>

      <div className="pricing-ui__toggle-wrap">
        <div className="pricing-ui__toggle" role="group" aria-label={toggleAriaLabel}>
          <button
            type="button"
            className={cn('pricing-ui__toggle-btn', isFullPayment && 'is-active')}
            aria-pressed={isFullPayment}
            onClick={selectFullPayment}
          >
            {fullPaymentLabel}
          </button>
          <button
            type="button"
            className={cn('pricing-ui__toggle-btn', 'pricing-ui__toggle-btn--split', !isFullPayment && 'is-active')}
            aria-pressed={!isFullPayment}
            onClick={selectSplitPayment}
          >
            <span>{splitPaymentLabel}</span>
            <span className="pricing-ui__toggle-badge">{splitBadge}</span>
          </button>
        </div>
        <p className="pricing-ui__toggle-hint">{toggleHint}</p>
      </div>

      <div className="pricing-ui-grid pricing-ui-grid--desktop">
        {plans.map((plan, index) => (
          <PricingPlanCard key={plan.name} plan={plan} index={index} {...cardProps} />
        ))}
      </div>

      <div className="pricing-ui-mobile">
        <div className="pricing-ui__tabs" role="tablist" aria-label={packagesLabel}>
          {plans.map((plan, index) => (
            <button
              key={plan.name}
              type="button"
              role="tab"
              className={cn(
                'pricing-ui__tab',
                activeMobilePlan === index && 'is-active',
                plan.isPopular && 'is-featured',
              )}
              aria-selected={activeMobilePlan === index}
              onClick={() => scrollToMobilePlan(index)}
            >
              {plan.name}
            </button>
          ))}
        </div>

        <HorizontalScroll
          ariaLabel={packagesLabel}
          className="pricing-ui__scroll"
          trackRef={mobileTrackRef}
          onScroll={syncActiveMobilePlan}
        >
          {plans.map((plan, index) => (
            <PricingPlanCard
              key={plan.name}
              plan={plan}
              index={index}
              {...cardProps}
              className="scroll-card pricing-ui-card--scroll"
            />
          ))}
        </HorizontalScroll>

        <p className="pricing-ui__swipe-hint">{swipeHint}</p>
      </div>
    </div>
  );
}
