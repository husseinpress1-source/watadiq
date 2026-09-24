const SITE_URL = 'https://watadiq.com';
const SITE_NAME = 'WATAD Software';

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function pickTitle(post, lang) {
  if (lang.startsWith('ar')) return post.titleAr || post.titleEn || '';
  return post.titleEn || post.titleAr || '';
}

function pickExcerpt(post, lang) {
  const raw =
    lang.startsWith('ar')
      ? post.excerptAr || post.excerptEn || ''
      : post.excerptEn || post.excerptAr || '';
  return String(raw).replace(/\s+/g, ' ').trim().slice(0, 300);
}

function absoluteImage(coverImage) {
  if (!coverImage) return `${SITE_URL}/favicon-512.png`;
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) return coverImage;
  return `${SITE_URL}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;
}

/** @param {import('./_blog.js').mapPost extends (...args: any[]) => infer R ? R : never} post */
export function buildBlogShareHead(post, { slug, lang = 'en' }) {
  const headline = pickTitle(post, lang);
  const description = pickExcerpt(post, lang) || headline;
  const documentTitle = `${headline} | ${SITE_NAME}`;
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
  const ogImage = absoluteImage(post.coverImage);
  const locale = lang.startsWith('ar') ? 'ar_IQ' : 'en_US';
  const localeAlt = lang.startsWith('ar') ? 'en_US' : 'ar_IQ';

  return `
    <title>${escapeAttr(documentTitle)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeAttr(headline)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    <meta property="og:image:secure_url" content="${escapeAttr(ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeAttr(headline)}" />
    <meta property="og:locale" content="${locale}" />
    <meta property="og:locale:alternate" content="${localeAlt}" />
    <meta property="article:author" content="${SITE_NAME}" />
    <meta property="article:publisher" content="${SITE_NAME}" />
    ${post.publishedAt ? `<meta property="article:published_time" content="${escapeAttr(post.publishedAt)}" />` : ''}
    ${post.updatedAt ? `<meta property="article:modified_time" content="${escapeAttr(post.updatedAt)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(headline)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />
    <meta name="twitter:image:alt" content="${escapeAttr(headline)}" />
  `.trim();
}

export function injectBlogShareMeta(html, headBlock, lang = 'en') {
  let out = html;
  out = out.replace(/<html lang="[^"]*">/i, `<html lang="${lang.startsWith('ar') ? 'ar' : 'en'}">`);
  out = out.replace(/<title>[\s\S]*?<\/title>/i, '');
  out = out.replace(/<meta name="description"[^>]*>/i, '');
  out = out.replace(/<link rel="canonical"[^>]*>/i, '');
  out = out.replace(/<meta property="og:[^>]+>/gi, '');
  out = out.replace(/<meta property="article:[^>]+>/gi, '');
  out = out.replace(/<meta name="twitter:[^>]+>/gi, '');
  return out.replace('</head>', `${headBlock}\n</head>`);
}

export function blogSlugFromPath(pathname) {
  const m = pathname.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/i);
  return m ? m[1].toLowerCase() : null;
}

export function htmlLangFromRequest(url, request) {
  const q = url.searchParams.get('lang');
  if (q === 'ar' || q === 'en') return q;
  const al = (request.headers.get('Accept-Language') || '').toLowerCase();
  return al.startsWith('ar') ? 'ar' : 'en';
}
