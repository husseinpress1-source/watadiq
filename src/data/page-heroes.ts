export type PageHeroSlug = 'about' | 'expertise' | 'team' | 'pricing' | 'contact' | 'security';

export interface PageHeroAssets {
  src: string;
  mobileSrc: string;
  altKey: string;
}

export const PAGE_HEROES: Record<PageHeroSlug, PageHeroAssets> = {
  about: {
    src: '/images/heroes/hero-about.png',
    mobileSrc: '/images/heroes/hero-about-mobile.png',
    altKey: 'pageHeroes.about',
  },
  expertise: {
    src: '/images/heroes/hero-expertise.png',
    mobileSrc: '/images/heroes/hero-expertise-mobile.png',
    altKey: 'pageHeroes.expertise',
  },
  team: {
    src: '/images/heroes/hero-team.png',
    mobileSrc: '/images/heroes/hero-team-mobile.png',
    altKey: 'pageHeroes.team',
  },
  pricing: {
    src: '/images/heroes/hero-pricing.png',
    mobileSrc: '/images/heroes/hero-pricing-mobile.png',
    altKey: 'pageHeroes.pricing',
  },
  contact: {
    src: '/images/heroes/hero-contact.png',
    mobileSrc: '/images/heroes/hero-contact-mobile.png',
    altKey: 'pageHeroes.contact',
  },
  security: {
    src: '/images/heroes/hero-security.png',
    mobileSrc: '/images/heroes/hero-security-mobile.png',
    altKey: 'pageHeroes.security',
  },
};

export function getPageHero(slug: string): PageHeroAssets | undefined {
  if (slug in PAGE_HEROES) {
    return PAGE_HEROES[slug as PageHeroSlug];
  }
  return undefined;
}
