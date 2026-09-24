import type { BlogPost, BlogPostListItem } from '../types/blog';

const API = '/api/blog';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchBlogPosts(): Promise<BlogPostListItem[]> {
  const res = await fetch(`${API}/posts?limit=24`);
  const data = await parseJson<{ posts: BlogPostListItem[] }>(res);
  return data.posts;
}

export async function fetchBlogPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API}/posts/${encodeURIComponent(slug)}`);
  const data = await parseJson<{ post: BlogPost }>(res);
  return data.post;
}

export function formatBlogDate(iso: string | null, lang: string): string {
  if (!iso) return '';
  const locale = lang.startsWith('ar') ? 'ar-IQ' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}
