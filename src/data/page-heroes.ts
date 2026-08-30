export type PageHeroSlug = 'about' | 'expertise' | 'team' | 'pricing' | 'contact' | 'security';

export interface PageHeroAssets {
  src: string;
  altKey: string;
}

export const PAGE_HEROES: Record<PageHeroSlug, PageHeroAssets> = {
  about: {
    src: '/images/heroes/hero-about.png',
    altKey: 'pageHeroes.about',
  },
  expertise: {
    src: '/images/heroes/hero-expertise.png',
    altKey: 'pageHeroes.expertise',
  },
  team: {
    src: '/images/heroes/hero-team.png',
    altKey: 'pageHeroes.team',
  },
  pricing: {
    src: '/images/heroes/hero-pricing.png',
    altKey: 'pageHeroes.pricing',
  },
  contact: {
    src: '/images/heroes/hero-contact.png',
    altKey: 'pageHeroes.contact',
  },
  security: {
    src: '/images/heroes/hero-security.png',
    altKey: 'pageHeroes.security',
  },
};

export function getPageHero(slug: string): PageHeroAssets | undefined {
  if (slug in PAGE_HEROES) {
    return PAGE_HEROES[slug as PageHeroSlug];
  }
  return undefined;
}
