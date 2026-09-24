export type ExpertiseIcon = 'web' | 'mobile' | 'design' | 'security' | 'commerce' | 'cloud';
export type LocationIcon = 'location-hq' | 'contact-hours';
export type ContactIcon = 'email' | 'instagram';
export type SiteIcon = ExpertiseIcon | LocationIcon | ContactIcon;

export const SITE_ICONS: Record<SiteIcon, string> = {
  web: '/assets/expertise/expertise-web-512.webp',
  mobile: '/assets/expertise/expertise-mobile-512.webp',
  design: '/assets/expertise/expertise-design-512.webp',
  security: '/assets/expertise/expertise-security-512.webp',
  commerce: '/assets/expertise/expertise-commerce-512.webp',
  cloud: '/assets/expertise/expertise-cloud-512.webp',
  'location-hq': '/assets/contact/contact-hq-512.webp',
  'contact-hours': '/assets/contact/contact-hours-512.webp',
  email: '/assets/contact/contact-email-512.webp',
  instagram: '/assets/contact/contact-instagram-512.webp',
};

export function getSiteIcon(icon?: string): string | undefined {
  if (!icon || !(icon in SITE_ICONS)) return undefined;
  return SITE_ICONS[icon as SiteIcon];
}

export type SiteIconAssets = {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
};

const EXPERTISE_ICON_SET = new Set<ExpertiseIcon>([
  'web',
  'mobile',
  'design',
  'security',
  'commerce',
  'cloud',
]);

const SIZED_ICON_SET = new Set<SiteIcon>([
  ...EXPERTISE_ICON_SET,
  'location-hq',
  'contact-hours',
  'email',
  'instagram',
]);

export function getSiteIconAssets(icon?: string, displaySize = 160): SiteIconAssets | undefined {
  const base = getSiteIcon(icon);
  if (!base) return undefined;

  if (!icon || !SIZED_ICON_SET.has(icon as SiteIcon)) {
    return {
      src: base,
      width: displaySize,
      height: displaySize,
    };
  }

  const stem = base.replace(/-512\.webp$/, '');
  return {
    src: `${stem}-256.webp`,
    srcSet: `${stem}-256.webp 1x, ${stem}-512.webp 2x`,
    width: displaySize,
    height: displaySize,
  };
}

export function getExpertiseIcon(icon?: string): string | undefined {
  return getSiteIcon(icon);
}
