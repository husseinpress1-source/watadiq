import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { Check } from 'lucide-react';

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
}) {
  const fullAmount = Number(plan.price);
  const installmentAmount = Number(plan.installmentPrice);
  const displayAmount = isFullPayment ? fullAmount : installmentAmount;

  const ctaClassName = cn('pricing-ui-card__cta', plan.isPopular && 'pricing-ui-card__cta--featured');

  return (
    <article className={cn('pricing-ui-card', plan.isPopular && 'pricing-ui-card--featured')}>
      <div className="pricing-ui-card__head">
        <h3 className="pricing-ui-card__name">{plan.name}</h3>
        {plan.isPopular ? <span className="pricing-ui-card__pill">{popularLabel}</span> : null}
      </div>

      <div className="pricing-ui-card__price-block">
        <div className="pricing-ui-card__price-row" dir="ltr" lang={locale.startsWith('ar') ? 'ar' : 'en'}>
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
          <span className="pricing-ui-card__period">/ {perProjectLabel}</span>
        </div>
        <p className="pricing-ui-card__billing">{isFullPayment ? billedFullLabel : billedSplitLabel}</p>
        {!isFullPayment ? (
          <p className="pricing-ui-card__total">
            {splitTotalLabel}:{' '}
            <span dir="ltr" lang={locale.startsWith('ar') ? 'ar' : 'en'}>
              {formatGrouped(fullAmount, locale)}
              {plan.priceSuffix ?? ''} {plan.currency}
            </span>
          </p>
        ) : null}
      </div>

      <p className="pricing-ui-card__desc">{plan.description}</p>

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
        {plan.note && plan.isPopular ? <p className="pricing-ui-card__note">{plan.note}</p> : null}
      </div>
    </article>
  );
}

export function Pricing({
  plans,
  title = 'Simple, Transparent Pricing',
  description = 'Choose the plan that works for you.',
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
  locale = 'en-IQ',
  onPlanAction,
}: PricingProps) {
  const [isFullPayment, setIsFullPayment] = useState(true);

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

      <div className="pricing-ui-grid">
        {plans.map((plan, index) => (
          <PricingPlanCard key={plan.name} plan={plan} index={index} {...cardProps} />
        ))}
      </div>
    </div>
  );
}
