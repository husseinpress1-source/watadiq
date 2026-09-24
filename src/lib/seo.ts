/** SEO constants and DOM helpers — site name, Open Graph, JSON-LD. */

export const SITE_URL = 'https://watadiq.com';
export const SITE_NAME = 'WATAD Software';
/** Primary name for WebSite / og:site_name (Google site name in SERP). */
export const SITE_SCHEMA_NAME = 'WATAD Software';
export const SITE_SCHEMA_ALTERNATES = ['WATAD', 'Watad', 'watadiq', 'وتد', 'وتد للبرمجيات'] as const;
export const SITE_SAME_AS = [
  'https://instagram.com/watd_iq',
  'https://github.com/husseinpress1-source/watadiq',
] as const;
export const OG_IMAGE = `${SITE_URL}/favicon-512.png`;
export const OG_IMAGE_WIDTH = 512;
export const OG_IMAGE_HEIGHT = 512;

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
  '/blog',
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

function routeSlug(pathname: string): string {
  return pathname.replace(/^\//, '').split('/')[0] || 'home';
}

function pageTitle(t: TFunction, pathname: string): string {
  if (pathname === '/' || pathname === '') return t('meta.title');
  const slug = routeSlug(pathname);
  const pageKey = `meta.pages.${slug}.title`;
  const segment = t(pageKey);
  if (segment === pageKey) return SITE_NAME;
  if (
    segment.includes(SITE_NAME) ||
    segment.includes('WATAD Software') ||
    segment.includes('وتد للبرمجيات')
  ) {
    return segment;
  }
  return `${SITE_NAME} | ${segment}`;
}

function pageDescription(t: TFunction, pathname: string): string {
  const slug = routeSlug(pathname);
  const pageKey = `meta.pages.${slug}.description`;
  const desc = t(pageKey);
  if (desc !== pageKey) return desc;
  return t('meta.description');
}

function publisherOrg(description: string) {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: [...SITE_SCHEMA_ALTERNATES],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: OG_IMAGE,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    },
    sameAs: [...SITE_SAME_AS],
    description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IQ',
    },
  };
}

function setCommonMeta(opts: {
  title: string;
  description: string;
  canonical: string;
  pathname: string;
  lang: string;
  ogType: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
}) {
  const {
    title,
    description,
    canonical,
    pathname,
    lang,
    ogType,
    image = OG_IMAGE,
    imageWidth = OG_IMAGE_WIDTH,
    imageHeight = OG_IMAGE_HEIGHT,
    imageAlt,
  } = opts;
  const path = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  document.title = title;

  upsertMeta('name', 'description', description);
  upsertMeta('name', 'author', SITE_NAME);
  upsertMeta('name', 'application-name', SITE_SCHEMA_NAME);
  upsertMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  upsertMeta('property', 'og:site_name', SITE_SCHEMA_NAME);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:type', ogType);
  upsertMeta('property', 'og:image', image);
  if (image.startsWith('https://')) {
    upsertMeta('property', 'og:image:secure_url', image);
  }
  upsertMeta('property', 'og:image:width', String(imageWidth));
  upsertMeta('property', 'og:image:height', String(imageHeight));
  if (imageAlt) upsertMeta('property', 'og:image:alt', imageAlt);
  upsertMeta('property', 'og:locale', lang.startsWith('ar') ? 'ar_IQ' : 'en_US');
  upsertMeta('property', 'og:locale:alternate', lang.startsWith('ar') ? 'en_US' : 'ar_IQ');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', image);
  if (imageAlt) upsertMeta('name', 'twitter:image:alt', imageAlt);

  upsertLink('canonical', canonical);
  upsertLink('alternate', canonical, { hreflang: 'x-default' });
  upsertLink('alternate', `${SITE_URL}${path}?lang=en`, { hreflang: 'en' });
  upsertLink('alternate', `${SITE_URL}${path}?lang=ar`, { hreflang: 'ar' });
}

function canonicalPath(pathname: string): string {
  const path = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return `${SITE_URL}${path}`;
}

export function applySeo(opts: { t: TFunction; lang: string; pathname: string }) {
  const { t, lang, pathname } = opts;
  const title = pageTitle(t, pathname);
  const description = pageDescription(t, pathname);
  const canonical = canonicalPath(pathname);
  const slug = routeSlug(pathname);

  setCommonMeta({
    title,
    description,
    canonical,
    pathname,
    lang,
    ogType: 'website',
  });

  upsertMeta('name', 'keywords', t('meta.keywords'));

  removeJsonLd('watad-site-jsonld');
  removeJsonLd('watad-blog-article-jsonld');
  removeJsonLd('watad-breadcrumb-jsonld');

  upsertJsonLd('watad-org-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [
      publisherOrg(t('meta.description')),
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#business`,
        name: SITE_NAME,
        url: SITE_URL,
        image: OG_IMAGE,
        priceRange: '$$',
        areaServed: { '@type': 'Country', name: 'Iraq' },
        serviceType: [
          'Web Development',
          'Mobile Application Development',
          'Cybersecurity',
          'UI/UX Design',
        ],
        sameAs: [...SITE_SAME_AS],
      },
    ],
  });

  if (slug === 'blog' && pathname === '/blog') {
    upsertJsonLd('watad-blog-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE_URL}/blog#blog`,
      name: t('blog.eyebrow'),
      description: t('blog.lead'),
      url: `${SITE_URL}/blog`,
      inLanguage: ['en', 'ar'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    });
  } else {
    removeJsonLd('watad-blog-jsonld');
  }
}

export function applyBlogPostSeo(opts: {
  headline: string;
  description: string;
  pathname: string;
  lang: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  slug: string;
}) {
  const { headline, description, pathname, lang, image, publishedAt, updatedAt, slug } = opts;
  const canonical = canonicalPath(pathname);
  const documentTitle = `${headline} | ${SITE_NAME}`;
  const ogImage = image?.startsWith('http') ? image : image ? `${SITE_URL}${image}` : OG_IMAGE;

  setCommonMeta({
    title: documentTitle,
    description,
    canonical,
    pathname,
    lang,
    ogType: 'article',
    image: ogImage,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: headline,
  });

  upsertMeta('property', 'article:author', SITE_NAME);
  upsertMeta('property', 'article:publisher', SITE_SCHEMA_NAME);
  if (publishedAt) upsertMeta('property', 'article:published_time', publishedAt);
  if (updatedAt) upsertMeta('property', 'article:modified_time', updatedAt);

  removeJsonLd('watad-blog-jsonld');

  upsertJsonLd('watad-breadcrumb-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Journal',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: headline,
        item: canonical,
      },
    ],
  });

  upsertJsonLd('watad-blog-article-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    headline,
    description,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    image: [ogImage],
    datePublished: publishedAt || undefined,
    dateModified: updatedAt || publishedAt || undefined,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
      },
    },
    isPartOf: {
      '@type': 'Blog',
      '@id': `${SITE_URL}/blog#blog`,
      name: 'The WATAD Journal',
      url: `${SITE_URL}/blog`,
    },
    inLanguage: lang.startsWith('ar') ? 'ar' : 'en',
    keywords: slug,
  });
}
