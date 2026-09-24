import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogCoverImg from '../components/blog/BlogCoverImg';
import BlogJournalTile from '../components/blog/BlogJournalTile';
import BlogPostShare from '../components/blog/BlogPostShare';
import { blogCoverPublicUrl } from '../lib/blogMediaUrl';
import { fetchBlogPost, fetchBlogPosts, formatBlogDate } from '../lib/blogApi';
import { blogBody, blogExcerpt, blogTitle, type BlogPost, type BlogPostListItem } from '../types/blog';
import { applyBlogPostSeo } from '../lib/seo';
import { useLegacyPlugins } from '../lib/plugins';
import './BlogPostPage.scss';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useLegacyPlugins();

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const [single, list] = await Promise.all([
          fetchBlogPost(slug),
          fetchBlogPosts(),
        ]);
        if (cancelled) return;
        setPost(single);
        setRelated(list.filter((p) => p.slug !== slug).slice(0, 3));
      } catch {
        if (!cancelled) setError(t('blog.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  useEffect(() => {
    if (!post) return;
    applyBlogPostSeo({
      headline: blogTitle(post, i18n.language),
      description: blogExcerpt(post, i18n.language),
      pathname: `/blog/${post.slug}`,
      lang: i18n.language,
      image: blogCoverPublicUrl(post.coverImage) || post.coverImage,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      slug: post.slug,
    });
  }, [post, i18n.language]);

  if (loading) {
    return (
      <div className="blog-post">
        <Header />
        <p className="blog-post__status" role="status">
          {t('blog.loading')}
        </p>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post">
        <Header />
        <div className="blog-post__status blog-post__status--error">
          <p role="alert">{error || t('blog.notFound')}</p>
          <Link to="/blog" className="blog-post__back">
            {t('blog.backToIndex')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const date = formatBlogDate(post.publishedAt, i18n.language);

  return (
    <div className="blog-post">
      <Header />
      <article className="blog-post__article">
        {post.coverImage ? (
          <div className="blog-post__cover">
            <BlogCoverImg storedSrc={post.coverImage} className="blog-post__cover-img" loading="eager" />
            <span className="blog-post__cover-fade" aria-hidden />
          </div>
        ) : null}
        <div className="blog-post__inner">
          <Link to="/blog" className="blog-post__crumb">
            {t('blog.backToIndex')}
          </Link>
          <header className="blog-post__header">
            {post.tags.length ? (
              <ul className="blog-post__tags">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            <div className="blog-post__title-row">
              <h1>{blogTitle(post, i18n.language)}</h1>
              <BlogPostShare slug={post.slug} title={blogTitle(post, i18n.language)} />
            </div>
            <p className="blog-post__meta">
              <span>{post.authorName}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt || undefined}>{date}</time>
              <span aria-hidden="true">·</span>
              <span>{t('blog.readTime', { count: post.readingTimeMin })}</span>
            </p>
          </header>
          <div
            className="blog-post__prose"
            dir={i18n.language.startsWith('ar') ? 'rtl' : 'ltr'}
            dangerouslySetInnerHTML={{ __html: blogBody(post, i18n.language) }}
          />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="blog-post__related" aria-label={t('blog.related')}>
          <h2>{t('blog.related')}</h2>
          <div className="blog-post__related-grid">
            {related.map((p) => (
              <BlogJournalTile key={p.id} post={p} lang={i18n.language} />
            ))}
          </div>
        </section>
      ) : null}
      <Footer />
    </div>
  );
}
