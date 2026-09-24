import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogExcerpt, blogTitle, type BlogPostListItem } from '../../types/blog';
import { formatBlogDate } from '../../lib/blogApi';
import BlogCoverImg from './BlogCoverImg';
import './BlogJournalTile.scss';

type Props = {
  post: BlogPostListItem;
  lang: string;
  featured?: boolean;
  showExcerpt?: boolean;
};

export default function BlogJournalTile({ post, lang, featured, showExcerpt }: Props) {
  const { t } = useTranslation();
  const date = formatBlogDate(post.publishedAt, lang);
  const title = blogTitle(post, lang);
  const excerpt = blogExcerpt(post, lang);

  return (
    <article
      className={
        featured ? 'blog-journal-tile blog-journal-tile--featured' : 'blog-journal-tile'
      }
    >
      <Link to={`/blog/${post.slug}`} className="blog-journal-tile__link">
        <span className="blog-journal-tile__visual">
          {post.coverImage ? (
            <BlogCoverImg storedSrc={post.coverImage} className="blog-journal-tile__img" />
          ) : (
            <span className="blog-journal-tile__placeholder" aria-hidden />
          )}
          <span className="blog-journal-tile__scrim" aria-hidden />
          <span className="blog-journal-tile__content">
            {post.tags[0] ? (
              <span className="blog-journal-tile__kicker">{post.tags[0]}</span>
            ) : null}
            <h2 className="blog-journal-tile__title">{title}</h2>
            {showExcerpt ? (
              <span className="blog-journal-tile__excerpt">{excerpt}</span>
            ) : null}
            <span className="blog-journal-tile__meta">
              <span>{date}</span>
              <span aria-hidden="true">·</span>
              <span>{t('blog.readTime', { count: post.readingTimeMin })}</span>
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}
