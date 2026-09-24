export const DEFAULT_MEDIA_ORIGIN = 'https://media.watadiq.com';

export function mediaOrigin(env) {
  return String(env?.BLOG_MEDIA_PUBLIC_URL || DEFAULT_MEDIA_ORIGIN).replace(/\/$/, '');
}

/** @param {string | null | undefined} stored */
export function mediaObjectKey(stored) {
  if (!stored || typeof stored !== 'string') return null;
  const s = stored.trim();
  if (!s) return null;

  const apiPrefix = '/api/blog/media/';
  if (s.startsWith(apiPrefix)) return s.slice(apiPrefix.length);

  try {
    const u = new URL(s);
    if (/^pub-[a-f0-9]+\.r2\.dev$/i.test(u.hostname)) {
      return u.pathname.replace(/^\//, '');
    }
    const origin = DEFAULT_MEDIA_ORIGIN;
    if (u.origin === origin || u.hostname === 'media.watadiq.com') {
      return u.pathname.replace(/^\//, '');
    }
  } catch {
    /* relative path */
  }

  if (!s.startsWith('/') && !s.startsWith('http') && s.includes('/')) return s;
  return null;
}

/** @param {import('@cloudflare/workers-types').Env} env */
export function publicCoverUrl(env, stored) {
  if (!stored || typeof stored !== 'string') return stored;
  const s = stored.trim();
  if (s.startsWith('/images/')) return s;

  const key = mediaObjectKey(s);
  if (key) return `${mediaOrigin(env)}/${key}`;

  return stored;
}
