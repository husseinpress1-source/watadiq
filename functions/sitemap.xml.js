const SITE = 'https://watadiq.com';

const STATIC = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/expertise', priority: '0.8', changefreq: 'monthly' },
  { loc: '/work', priority: '0.8', changefreq: 'monthly' },
  { loc: '/live', priority: '0.85', changefreq: 'weekly' },
  { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
  { loc: '/team', priority: '0.7', changefreq: 'monthly' },
  { loc: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.9', changefreq: 'monthly' },
  { loc: '/security', priority: '0.85', changefreq: 'monthly' },
  { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function urlEntry(loc, { lastmod, priority, changefreq }) {
  const href = `${SITE}${loc}`;
  return `<url>
  <loc>${escapeXml(href)}</loc>${lastmod ? `\n  <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
  <changefreq>${changefreq}</changefreq>
  <priority>${priority}</priority>
  <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${href}?lang=en`)}"/>
  <xhtml:link rel="alternate" hreflang="ar" href="${escapeXml(`${href}?lang=ar`)}"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(href)}"/>
</url>`;
}

export async function onRequest(context) {
  const posts = [];
  try {
    const db = context.env.DB;
    if (db) {
      const { results } = await db
        .prepare(
          `SELECT slug, updated_at, published_at FROM posts WHERE status = 'published' ORDER BY published_at DESC`,
        )
        .all();
      for (const row of results || []) {
        posts.push({
          loc: `/blog/${row.slug}`,
          lastmod: (row.updated_at || row.published_at || '').slice(0, 10),
          priority: '0.75',
          changefreq: 'monthly',
        });
      }
    }
  } catch {
    /* static sitemap only */
  }

  const body = [...STATIC, ...posts].map((item) => urlEntry(item.loc, item)).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
