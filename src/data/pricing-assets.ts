import type { PricingPlan } from './watad-pages';

export type PricingTier = 'launch' | 'business' | 'scale' | 'enterprise';

const PLAN_TIER: Record<string, PricingTier> = {
  Launch: 'launch',
  Business: 'business',
  Scale: 'scale',
  Enterprise: 'enterprise',
};

export function getPricingTier(plan: PricingPlan): PricingTier {
  return PLAN_TIER[plan.name] ?? 'launch';
}
