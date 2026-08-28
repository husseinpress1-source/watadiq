export type ExpertiseIcon = 'web' | 'mobile' | 'design' | 'security' | 'commerce' | 'cloud';
export type LocationIcon = 'location-hq' | 'location-remote';
export type ContactIcon = 'email' | 'instagram';
export type SiteIcon = ExpertiseIcon | LocationIcon | ContactIcon;

export const SITE_ICONS: Record<SiteIcon, string> = {
  web: '/assets/expertise/expertise-web.png',
  mobile: '/assets/expertise/expertise-mobile.png',
  design: '/assets/expertise/expertise-design.png',
  security: '/assets/expertise/expertise-security.png',
  commerce: '/assets/expertise/expertise-commerce.png',
  cloud: '/assets/expertise/expertise-cloud.png',
  'location-hq': '/assets/icons/location-hq.png',
  'location-remote': '/assets/icons/location-remote.png',
  email: '/assets/icons/contact-email.png',
  instagram: '/assets/icons/contact-instagram.png',
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

export function getSiteIconAssets(icon?: string, displaySize = 160): SiteIconAssets | undefined {
  const base = getSiteIcon(icon);
  if (!base) return undefined;

  // Contact/location icons ship as single PNG masters (no -256/-512 exports).
  if (!icon || !EXPERTISE_ICON_SET.has(icon as ExpertiseIcon)) {
    return {
      src: base,
      width: displaySize,
      height: displaySize,
    };
  }

  const stem = base.replace(/\.png$/, '');
  return {
    src: `${stem}-256.png`,
    srcSet: `${stem}-256.png 1x, ${stem}-512.png 2x`,
    width: displaySize,
    height: displaySize,
  };
}

export function getExpertiseIcon(icon?: string): string | undefined {
  return getSiteIcon(icon);
}
