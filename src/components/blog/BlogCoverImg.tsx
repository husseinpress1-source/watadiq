import { useEffect, useState } from 'react';
import { blogCoverDisplaySrc, blogCoverFallbackSrc } from '../../lib/blogMediaUrl';

type Props = {
  storedSrc: string;
  className?: string;
  loading?: 'lazy' | 'eager';
};

export default function BlogCoverImg({ storedSrc, className, loading = 'lazy' }: Props) {
  const [src, setSrc] = useState(() => blogCoverDisplaySrc(storedSrc));

  useEffect(() => {
    setSrc(blogCoverDisplaySrc(storedSrc));
  }, [storedSrc]);

  return (
    <img
      className={className}
      src={src}
      alt=""
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => {
        const fallback = blogCoverFallbackSrc(storedSrc);
        if (fallback && src !== fallback) setSrc(fallback);
      }}
    />
  );
}
