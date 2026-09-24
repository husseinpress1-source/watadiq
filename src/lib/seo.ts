/** SEO constants and DOM helpers — site name, Open Graph, JSON-LD. */

export const SITE_URL = 'https://watadiq.com';
/** Full legal/brand name for titles, footer, and Organization schema. */
export const SITE_NAME = 'WATAD Software';
/** Concise site name Google prefers for SERP site-name display. */
export const SITE_SCHEMA_NAME = 'WATAD';
export const SITE_SCHEMA_ALTERNATES = ['WATAD Software', 'Watad', 'وتد', 'watadiq.com'] as const;
export const SITE_SAME_AS = [
  'https://instagram.com/watd_iq',
  'https://github.com/husseinpress1-source/watadiq',
] as const;
export const OG_IMAGE = `${SITE_URL}/favicon-512.png`;

export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/expertise',
  '/work',
  '/live',
  '/team',
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/security',
] as const;

type TFunction = (key: string, options?: Record<string, unknown>) => string;

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra?.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (extra?.hreflang) el.hreflang = extra.hreflang;
  if (extra?.type) el.type = extra.type;
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

function pageTitle(t: TFunction, pathname: string): string {
  const slug = pathname.replace(/^\//, '').split('/')[0] || 'home';
  const pageKey = `meta.pages.${slug}.title`;
  const pageTitleValue = t(pageKey);
  if (pageTitleValue !== pageKey) return pageTitleValue;
  if (slug === 'home' || pathname === '/') return t('meta.title');
  return `${t(`meta.pages.${slug}.title`, { defaultValue: SITE_NAME })} | ${SITE_NAME}`;
}

function pageDescription(t: TFunction, pathname: string): string {
  const slug = pathname.replace(/^\//, '').split('/')[0] || 'home';
  const pageKey = `meta.pages.${slug}.description`;
  const desc = t(pageKey);
  if (desc !== pageKey) return desc;
  return t('meta.description');
}

export function applySeo(opts: { t: TFunction; lang: string; pathname: string }) {
  const { t, lang, pathname } = opts;
  const title = pageTitle(t, pathname);
  const description = pageDescription(t, pathname);
  const canonical = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;

  document.title = title;

  upsertMeta('name', 'description', description);
  upsertMeta('name', 'keywords', t('meta.keywords'));
  upsertMeta('name', 'author', SITE_NAME);
  upsertMeta('name', 'application-name', SITE_SCHEMA_NAME);
  upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');

  upsertMeta('property', 'og:site_name', SITE_SCHEMA_NAME);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:type', pathname === '/' ? 'website' : 'article');
  upsertMeta('property', 'og:image', OG_IMAGE);
  upsertMeta('property', 'og:locale', lang === 'ar' ? 'ar_IQ' : 'en_US');
  upsertMeta('property', 'og:locale:alternate', lang === 'ar' ? 'en_US' : 'ar_IQ');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', OG_IMAGE);

  upsertLink('canonical', canonical);
  upsertLink('alternate', canonical, { hreflang: 'x-default' });
  upsertLink('alternate', `${SITE_URL}${pathname}?lang=en`, { hreflang: 'en' });
  upsertLink('alternate', `${SITE_URL}${pathname}?lang=ar`, { hreflang: 'ar' });

  // WebSite JSON-LD lives only in index.html (static) — never inject a second block.
  removeJsonLd('watad-site-jsonld');

  upsertJsonLd('watad-org-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: [...SITE_SCHEMA_ALTERNATES],
    url: SITE_URL,
    logo: OG_IMAGE,
    sameAs: [...SITE_SAME_AS],
    description: t('meta.description'),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IQ',
    },
    areaServed: ['IQ', 'MENA'],
    knowsAbout: ['Web Development', 'Mobile Applications', 'Cybersecurity'],
  });
}

