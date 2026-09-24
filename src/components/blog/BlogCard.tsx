import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogExcerpt, blogTitle, type BlogPostListItem } from '../../types/blog';
import { formatBlogDate } from '../../lib/blogApi';
import BlogCoverImg from './BlogCoverImg';

type Props = {
  post: BlogPostListItem;
  lang: string;
  featured?: boolean;
};

export default function BlogCard({ post, lang, featured }: Props) {
  const { t } = useTranslation();
  const date = formatBlogDate(post.publishedAt, lang);

  return (
    <article
      className={featured ? 'blog-card blog-card--featured' : 'blog-card'}
    >
      <Link to={`/blog/${post.slug}`} className="blog-card__link">
        {post.coverImage ? (
          <div className="blog-card__media">
            <BlogCoverImg storedSrc={post.coverImage} className="blog-card__img" />
            <span className="blog-card__media-fade" aria-hidden />
          </div>
        ) : null}
        <div className="blog-card__body">
          {post.tags[0] ? (
            <span className="blog-card__tag">{post.tags[0]}</span>
          ) : null}
          <h2 className="blog-card__title">{blogTitle(post, lang)}</h2>
          <p className="blog-card__excerpt">{blogExcerpt(post, lang)}</p>
          <footer className="blog-card__meta">
            <span>{date}</span>
            <span aria-hidden="true">·</span>
            <span>{t('blog.readTime', { count: post.readingTimeMin })}</span>
          </footer>
        </div>
      </Link>
    </article>
  );
}
