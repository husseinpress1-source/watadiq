export const PAGE_HEROES: Record<string, string> = {
  home: '/images/heroes/hero-home-1280.webp',
  about: '/images/heroes/hero-about.webp',
  expertise: '/images/heroes/hero-expertise.webp',
  team: '/images/heroes/hero-team.webp',
  pricing: '/images/heroes/hero-pricing.webp',
  contact: '/images/heroes/hero-contact.webp',
  work: '/images/work/crazy-screenshot.webp',
};

export function getPageHero(slug: string): string {
  return PAGE_HEROES[slug] ?? PAGE_HEROES.home;
}
