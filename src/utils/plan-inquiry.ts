import type { TFunction } from 'i18next';
import type { PricingPlan } from '../data/watad-pages';
import { getPricingTier } from '../data/pricing-assets';
import { WATAD_EMAIL } from '../data/contact-channels';

export function buildPlanInquirySubject(plan: PricingPlan, t: TFunction): string {
  const tier = getPricingTier(plan);
  return t(`pricingInquiry.subjects.${tier}`, { planName: plan.name });
}

export function buildPlanInquiryMessage(plan: PricingPlan, t: TFunction, notes: string): string {
  const tier = getPricingTier(plan);
  const priceLine = t('pricingInquiry.priceLine', {
    price: plan.price,
    currency: plan.currency,
    period: plan.period ?? '',
  });

  const base = t(`pricingInquiry.templates.${tier}`, {
    planName: plan.name,
    priceLine,
  });

  const trimmedNotes = notes.trim();
  if (!trimmedNotes) {
    return `${base}\n\n${t('pricingInquiry.signOff')}`;
  }

  return `${base}\n\n${t('pricingInquiry.notesHeading')}\n${trimmedNotes}\n\n${t('pricingInquiry.signOff')}`;
}

export function buildMailtoUrl(plan: PricingPlan, t: TFunction, message: string): string {
  const subject = encodeURIComponent(buildPlanInquirySubject(plan, t));
  const body = encodeURIComponent(message);
  return `mailto:${WATAD_EMAIL}?subject=${subject}&body=${body}`;
}
