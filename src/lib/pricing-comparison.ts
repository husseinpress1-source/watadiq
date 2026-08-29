export const PRICING_PLAN_KEYS = ['launch', 'business', 'scale', 'enterprise'] as const;

export type PricingPlanKey = (typeof PRICING_PLAN_KEYS)[number];

export type PricingCompareCell = boolean | string;

export type PricingCompareFeature = {
  id: string;
  label: string;
  launch: PricingCompareCell;
  business: PricingCompareCell;
  scale: PricingCompareCell;
  enterprise: PricingCompareCell;
};

export type PricingCompareCategory = {
  id: string;
  title: string;
  features: PricingCompareFeature[];
};

export type PricingCompareContent = {
  title: string;
  searchPlaceholder: string;
  featureColumn: string;
  selectPlanLabel: string;
  emptyResults: string;
  categories: PricingCompareCategory[];
};

export function planNameToKey(name: string): PricingPlanKey | null {
  const normalized = name.trim().toLowerCase();
  if (normalized === 'launch') return 'launch';
  if (normalized === 'business') return 'business';
  if (normalized === 'scale') return 'scale';
  if (normalized === 'enterprise') return 'enterprise';
  return null;
}

export function filterComparisonCategories(
  categories: PricingCompareCategory[],
  query: string,
): PricingCompareCategory[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return categories;

  return categories
    .map((category) => ({
      ...category,
      features: category.features.filter(
        (feature) =>
          feature.label.toLowerCase().includes(needle) ||
          category.title.toLowerCase().includes(needle),
      ),
    }))
    .filter((category) => category.features.length > 0);
}
