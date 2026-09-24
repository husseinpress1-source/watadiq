import type { TFunction } from 'i18next';
import type { WatadPage } from '../data/watad-pages';

export function getWatadPage(t: TFunction, slug: string): WatadPage | undefined {
  const page = t(`pages.${slug}`, { returnObjects: true });
  if (!page || typeof page === 'string') return undefined;
  const data = page as Omit<WatadPage, 'slug'>;
  return { ...data, slug };
}

export const LOCALE_OPTIONS = [
  { code: 'en' as const, labelKey: 'common.english' },
  { code: 'ar' as const, labelKey: 'common.arabic' },
];
