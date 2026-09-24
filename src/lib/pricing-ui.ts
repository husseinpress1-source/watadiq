import type { PricingPlan as WatadPricingPlan } from '@/data/watad-pages';
import type { PricingPlan as UiPricingPlan } from '@/components/ui/pricing';
import { formatPlanAmount } from '@/components/ui/pricing';

export function getNumberLocale(lang: string): string {
  return lang.startsWith('ar') ? 'ar-IQ-u-nu-latn' : 'en-IQ';
}

export function formatPriceAmount(value: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(value);
  } catch {
    return new Intl.NumberFormat('en-IQ', {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(value);
  }
}

interface MapPlansOptions {
  currencyLabel?: string;
}

export function mapWatadPlansToUi(plans: WatadPricingPlan[], options: MapPlansOptions = {}): UiPricingPlan[] {
  return plans.map((plan) => {
    const { numeric, suffix } = formatPlanAmount(plan.price);
    const installmentPrice = Math.round(numeric / 2);

    return {
      name: plan.name,
      price: String(numeric),
      installmentPrice: String(installmentPrice),
      period: plan.period?.replace(/^\s*\/?\s*/, '') || 'project',
      currency: options.currencyLabel ?? plan.currency ?? 'IQD',
      features: plan.features ?? [],
      description: plan.description,
      note: plan.note,
      buttonText: plan.cta.label,
      href: plan.cta.href,
      isPopular: Boolean(plan.featured),
      priceSuffix: suffix || undefined,
    };
  });
}

export function findWatadPlanByName(plans: WatadPricingPlan[], name: string) {
  return plans.find((plan) => plan.name === name) ?? null;
}
