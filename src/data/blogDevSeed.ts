import type { BlogPost, BlogPostListItem } from '../types/blog.js';

const posts: BlogPost[] = [
  {
    id: 'post_watad_cloudflare',
    slug: 'watadiq-on-cloudflare-edge',
    status: 'published',
    publishedAt: '2026-03-20T10:00:00.000Z',
    coverImage: '/images/home/highlight-1.jpg',
    readingTimeMin: 6,
    authorName: 'WATAD Software',
    tags: ['Engineering', 'Cloud', 'Performance'],
    titleEn: 'Why we moved watadiq.com to Cloudflare Pages',
    titleAr: 'لماذا نقلنا watadiq.com إلى Cloudflare Pages',
    excerptEn:
      'Faster global delivery, stronger SSL, and a single edge for our marketing site and blog API—without sacrificing the craft our clients expect.',
    excerptAr:
      'توصيل أسرع عالمياً، SSL أقوى، ومنصة edge واحدة للموقع والمدونة—دون التنازل عن جودة التصميم والهندسة التي يتوقعها عملاؤنا.',
    bodyEn:
      '<p>When your brand lives on the web, every millisecond matters. WATAD Software rebuilt watadiq.com on <strong>Cloudflare Pages</strong>.</p>',
    bodyAr:
      '<p>عندما يعيش اسمك على الويب، كل جزء من الثانية له وزن. أعدنا بناء watadiq.com على <strong>Cloudflare Pages</strong>.</p>',
    updatedAt: '2026-03-20T10:00:00.000Z',
  },
  {
    id: 'post_security_basics',
    slug: 'security-basics-for-iraqi-startups',
    status: 'published',
    publishedAt: '2026-03-10T09:00:00.000Z',
    coverImage: '/images/home/highlight-3.jpg',
    readingTimeMin: 8,
    authorName: 'WATAD Software',
    tags: ['Security', 'Startups', 'OWASP'],
    titleEn: 'Security basics every Iraqi startup should ship with',
    titleAr: 'أساسيات أمان يجب أن يطلق بها كل ستارت‑أب عراقي',
    excerptEn:
      'You do not need a red-team budget on day one—but you do need HTTPS, secrets hygiene, and a plan before your first breach headline.',
    excerptAr:
      'لا تحتاج ميزانية red team من اليوم الأول—لكنك تحتاج HTTPS، وإدارة أسرار، وخطة قبل أول عنوان خبر عن اختراق.',
    bodyEn: '<p>Most breaches are leaked API keys and open admin panels—not Hollywood hacks.</p>',
    bodyAr: '<p>أغلب الاختراقات هي مفاتيح API مسرّبة ولوحات إدارة مفتوحة.</p>',
    updatedAt: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 'post_watad_live_teaser',
    slug: 'inside-watad-live-streaming',
    status: 'published',
    publishedAt: '2026-02-28T12:00:00.000Z',
    coverImage: '/images/home/promo-story.webp',
    readingTimeMin: 5,
    authorName: 'WATAD Software',
    tags: ['Product', 'Streaming', 'WATAD Live'],
    titleEn: 'Inside WATAD Live: streaming built for Arabic audiences',
    titleAr: 'من داخل WATAD Live: بث مبني لجمهور عربي',
    excerptEn:
      'Movies, series, watch parties, and family profiles—how we are designing WATAD Live without copying Western apps verbatim.',
    excerptAr:
      'أفلام ومسلسلات وحفلات مشاهدة وملفات عائلية—كيف نصمم WATAD Live دون نسخ تطبيقات غربية حرفياً.',
    bodyEn: '<p><a href="/live">WATAD Live</a> is our streaming product for Arabic-first discovery.</p>',
    bodyAr: '<p><a href="/live">WATAD Live</a> منتج البث للاكتشاف العربي أولاً.</p>',
    updatedAt: '2026-02-28T12:00:00.000Z',
  },
];

export function devListPosts(): BlogPostListItem[] {
  return posts.map(({ bodyEn: _b, bodyAr: _a, ...rest }) => rest);
}

export function devGetPost(slug: string): BlogPost | null {
  return posts.find((p) => p.slug === slug) ?? null;
}
