export const BLOG_MEDIA_ORIGIN = 'https://media.watadiq.com';

function mediaObjectKey(stored: string): string | null {
  const s = stored.trim();
  if (!s) return null;

  const apiPrefix = '/api/blog/media/';
  if (s.startsWith(apiPrefix)) return s.slice(apiPrefix.length);

  try {
    const u = new URL(s);
    if (/^pub-[a-f0-9]+\.r2\.dev$/i.test(u.hostname)) {
      return u.pathname.replace(/^\//, '');
    }
    if (u.hostname === 'media.watadiq.com') {
      return u.pathname.replace(/^\//, '');
    }
  } catch {
    /* relative */
  }

  if (!s.startsWith('/') && !s.startsWith('http') && s.includes('/')) return s;
  return null;
}

/** Canonical shareable URL (media.watadiq.com). */
export function blogCoverPublicUrl(stored: string | null | undefined): string {
  if (!stored) return '';
  const key = mediaObjectKey(stored);
  if (key) return `${BLOG_MEDIA_ORIGIN}/${key}`;
  return stored;
}

/** Prefer CDN; fall back to Pages proxy for the same object. */
export function blogCoverDisplaySrc(stored: string | null | undefined): string {
  if (!stored) return '';
  if (stored.startsWith('/images/')) return stored;
  const key = mediaObjectKey(stored);
  if (key) return `${BLOG_MEDIA_ORIGIN}/${key}`;
  return stored;
}

export function blogCoverFallbackSrc(stored: string | null | undefined): string | null {
  const key = mediaObjectKey(stored ?? '');
  if (!key) return null;
  return `/api/blog/media/${key}`;
}

export function isBlogMediaUrl(stored: string | null | undefined): boolean {
  return Boolean(stored && mediaObjectKey(stored));
}
