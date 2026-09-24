import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SITE_NAME, SITE_URL } from '../../lib/seo';
import './BlogPostShare.scss';

type Props = {
  slug: string;
  title: string;
};

export default function BlogPostShare({ slug, title }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;

  const onShare = useCallback(async () => {
    const payload = {
      title: `${title} | ${SITE_NAME}`,
      text: title,
      url: shareUrl,
    };

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt(t('blog.shareCopyPrompt'), shareUrl);
    }
  }, [shareUrl, title, t]);

  return (
    <div className="blog-post-share">
      <button type="button" className="blog-post-share__btn" onClick={() => void onShare()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>{copied ? t('blog.shareCopied') : t('blog.share')}</span>
      </button>
    </div>
  );
}
