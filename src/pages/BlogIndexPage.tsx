import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogJournalTile from '../components/blog/BlogJournalTile';
import { fetchBlogPosts } from '../lib/blogApi';
import type { BlogPostListItem } from '../types/blog';
import { useLegacyPlugins } from '../lib/plugins';
import './BlogIndexPage.scss';

export default function BlogIndexPage() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useLegacyPlugins();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBlogPosts();
        if (!cancelled) setPosts(data);
      } catch {
        if (!cancelled) setError(t('blog.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="blog-index">
      <Header />
      <header className="blog-index__hero">
        <div className="blog-index__hero-inner">
          <p className="blog-index__eyebrow">{t('blog.eyebrow')}</p>
          <h1 className="blog-index__title">{t('blog.title')}</h1>
          <p className="blog-index__lead">{t('blog.lead')}</p>
          <p className="blog-index__byline">{t('blog.byline')}</p>
        </div>
      </header>

      <main className="blog-index__main">
        {loading ? (
          <p className="blog-index__status" role="status">
            {t('blog.loading')}
          </p>
        ) : null}
        {error ? (
          <p className="blog-index__status blog-index__status--error" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && posts.length === 0 ? (
          <p className="blog-index__status">{t('blog.empty')}</p>
        ) : null}

        {posts.length > 0 ? (
          <section className="blog-index__grid" aria-label={t('blog.latest')}>
            {posts.map((post, index) => (
              <BlogJournalTile
                key={post.id}
                post={post}
                lang={i18n.language}
                featured={index === 0 && posts.length > 1}
                showExcerpt={index === 0}
              />
            ))}
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
