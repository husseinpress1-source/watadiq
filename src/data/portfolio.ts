export interface PortfolioProject {
  id: string;
  url: string;
  screenshot: string;
  logo: string;
  i18nKey: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'victorian',
    url: 'https://victorianiraq.com',
    screenshot: '/images/work/victorian-screenshot.png',
    logo: '/images/work/victorian-logo.jpg',
    i18nKey: 'victorian',
  },
  {
    id: 'crazy',
    url: 'https://crazystore1.com',
    screenshot: '/images/work/crazy-screenshot.png',
    logo: '/images/work/crazy-logo.png',
    i18nKey: 'crazy',
  },
];
