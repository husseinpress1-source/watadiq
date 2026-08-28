export const HERO_HOME = '/images/heroes/hero-home-1280.webp';

export const HERO_HOME_SRCSET =
  '/images/heroes/hero-home-768.webp 768w, /images/heroes/hero-home-1280.webp 1280w';

export const exhibitionAssets = [
  { id: '1', image: '/images/home/exhibition-1.jpg', href: '/expertise' },
  { id: '2', image: '/images/home/exhibition-2.jpg', href: '/expertise' },
  { id: '3', image: '/images/home/exhibition-3.jpg', href: '/expertise' },
  { id: '4', image: '/images/home/exhibition-4.jpg', href: '/expertise' },
  { id: '5', image: '/images/home/exhibition-2.jpg', href: '/pricing' },
  { id: '6', image: '/images/home/exhibition-3.jpg', href: '/expertise' },
];

export const highlightAssets = [
  { id: '1', image: '/images/home/highlight-1.jpg', href: '/expertise' },
  { id: '2', image: '/images/home/highlight-2.jpg', href: '/expertise' },
  { id: '3', image: '/images/home/highlight-3.jpg', href: '/expertise' },
  { id: '4', image: '/images/home/highlight-4.jpg', href: '/pricing' },
  { id: '5', image: '/images/home/highlight-5.jpg', href: '/about' },
];

export const locationAssets = [
  { id: '1', icon: 'location-hq' as const, href: '/contact' },
  { id: '2', icon: 'location-remote' as const, href: '/contact' },
];

export const promoAssets = [
  { id: '1', image: '/images/home/promo-1.png', href: '/about', reverse: false },
  { id: '2', image: '/images/home/promo-2.png', href: '/pricing', reverse: true },
];

export const navHrefs = [
  { key: 'about', href: '/about' },
  { key: 'expertise', href: '/expertise' },
  { key: 'work', href: '/work' },
  { key: 'live', href: '/live' },
  { key: 'team', href: '/team' },
  { key: 'pricing', href: '/pricing' },
  { key: 'contact', href: '/contact' },
] as const;

export const mobileNavStructure = [
  {
    key: 'about',
    children: [
      { key: 'ourStory', href: '/about' },
      { key: 'team', href: '/team' },
      { key: 'contact', href: '/contact' },
    ],
  },
  {
    key: 'expertise',
    children: [
      { key: 'allServices', href: '/expertise' },
      { key: 'webDev', href: '/expertise' },
      { key: 'mobileApps', href: '/expertise' },
      { key: 'cybersecurity', href: '/expertise' },
    ],
  },
  { key: 'work', href: '/work' },
  { key: 'live', href: '/live' },
  {
    key: 'pricing',
    children: [
      { key: 'allPlans', href: '/pricing' },
      { key: 'launch', href: '/pricing' },
      { key: 'business', href: '/pricing' },
      { key: 'enterprise', href: '/pricing' },
    ],
  },
  { key: 'contact', href: '/contact' },
] as const;
