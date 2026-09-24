import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useWatadOne } from '../context/WatadOneContext';
import {
  adminDeleteBlogPost,
  adminFetchBlogPost,
  adminListBlogPosts,
  adminSaveBlogPost,
  adminUploadBlogCover,
} from '../lib/watadOneApi';
import type { BlogPostListItem } from '../types/blog';
import { blogTitle } from '../types/blog';
import {
  compressImageToWebp,
  excerptToBodyEn,
  htmlBodyToPlain,
  plainToHtmlBody,
} from '../lib/compressImageWebp';
import { useLegacyPlugins } from '../lib/plugins';
import './AdminBlogPage.scss';

const emptyForm = {
  id: '' as string,
  slug: '',
  status: 'published' as 'published' | 'draft',
  coverImage: '',
  readingTimeMin: 6,
  tags: '',
  titleEn: '',
  titleAr: '',
  excerptEn: '',
  excerptAr: '',
  bodyAr: '',
};

export default function AdminBlogPage() {
  const { t, i18n } = useTranslation();
  const { account, loading, isAdmin, logout } = useWatadOne();
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [postsOpen, setPostsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useLegacyPlugins();

  useEffect(() => {
    if (!isAdmin) return;
    adminListBlogPosts()
      .then((list) => setPosts(list as BlogPostListItem[]))
      .catch(() => setError(t('adminBlog.loadError')));
  }, [isAdmin, t]);

  useEffect(() => {
    if (!postsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPostsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [postsOpen]);

  if (!loading && !account) {
    return <Navigate to="/account/sign-in?return=/admin/blog" replace />;
  }

  if (!loading && account && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const currentLabel = form.id
    ? blogTitle(
        {
          titleEn: form.titleEn,
          titleAr: form.titleAr,
        } as BlogPostListItem,
        i18n.language,
      )
    : t('adminBlog.newPostEditor');

  async function refreshPosts() {
    const list = await adminListBlogPosts();
    setPosts(list as BlogPostListItem[]);
  }

  async function loadPost(p: BlogPostListItem) {
    setNotice(null);
    setError(null);
    setPostsOpen(false);
    try {
      const full = (await adminFetchBlogPost(p.slug)) as {
        id: string;
        slug: string;
        status: string;
        coverImage: string | null;
        readingTimeMin: number;
        tags: string[];
        titleEn: string;
        titleAr: string;
        excerptEn: string;
        excerptAr: string;
        bodyAr: string;
      };
      setForm({
        id: full.id,
        slug: full.slug,
        status: full.status === 'draft' ? 'draft' : 'published',
        coverImage: full.coverImage || '',
        readingTimeMin: full.readingTimeMin,
        tags: full.tags.join(', '),
        titleEn: full.titleEn,
        titleAr: full.titleAr,
        excerptEn: full.excerptEn,
        excerptAr: full.excerptAr,
        bodyAr: htmlBodyToPlain(full.bodyAr),
      });
    } catch {
      setForm({
        id: p.id,
        slug: p.slug,
        status: p.status === 'draft' ? 'draft' : 'published',
        coverImage: p.coverImage || '',
        readingTimeMin: p.readingTimeMin,
        tags: p.tags.join(', '),
        titleEn: p.titleEn,
        titleAr: p.titleAr,
        excerptEn: p.excerptEn,
        excerptAr: p.excerptAr,
        bodyAr: '',
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onDeletePost(target?: { id: string; slug: string; titleEn: string; titleAr: string }) {
    const id = target?.id || form.id;
    const slug = target?.slug || form.slug;
    const title = target?.titleAr || target?.titleEn || form.titleAr || form.titleEn || slug;
    if (!slug && !id) return;
    if (!window.confirm(t('adminBlog.deleteConfirm', { title }))) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await adminDeleteBlogPost({ id, slug });
      setPosts((prev) => prev.filter((p) => p.id !== id && p.slug !== slug));
      setNotice(t('adminBlog.deleted'));
      if (form.id === id || form.slug === slug) setForm(emptyForm);
      await refreshPosts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg === 'Post not found' ? t('adminBlog.deleteNotFound') : t('adminBlog.deleteError'));
    } finally {
      setBusy(false);
    }
  }

  async function onPickCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    const previewUrl = URL.createObjectURL(file);
    setForm((f) => ({ ...f, coverImage: previewUrl }));
    setUploading(true);
    setError(null);
    setNotice(null);

    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    try {
      const webp = await compressImageToWebp(file);
      const url = await adminUploadBlogCover(webp);
      URL.revokeObjectURL(previewUrl);
      setForm((f) => ({ ...f, coverImage: url }));
      setNotice(t('adminBlog.coverUploaded'));
    } catch {
      URL.revokeObjectURL(previewUrl);
      setForm((f) => ({
        ...f,
        coverImage: f.coverImage === previewUrl ? '' : f.coverImage,
      }));
      setError(t('adminBlog.uploadError'));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const bodyAr = plainToHtmlBody(form.bodyAr);
      await adminSaveBlogPost({
        ...form,
        bodyEn: excerptToBodyEn(form.excerptEn),
        bodyAr,
        tags: form.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        readingTimeMin: Number(form.readingTimeMin),
        coverImage: form.coverImage || '/images/home/highlight-2.jpg',
      });
      setNotice(t('adminBlog.saved'));
      await refreshPosts();
    } catch {
      setError(t('adminBlog.saveError'));
    } finally {
      setBusy(false);
    }
  }

  function renderPostList(inSheet: boolean) {
    return (
      <ul className={inSheet ? 'admin-blog__sheet-list' : 'admin-blog__rail-list'}>
        {posts.map((p) => {
          const active = form.id === p.id;
          return (
            <li key={p.id}>
              <div className={`admin-blog__row ${active ? 'is-active' : ''}`}>
                <button type="button" className="admin-blog__row-main" onClick={() => loadPost(p)}>
                  <span className="admin-blog__post-title">{blogTitle(p, i18n.language)}</span>
                  <span className={`admin-blog__status admin-blog__status--${p.status}`}>
                    {p.status}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-blog__row-delete"
                  aria-label={t('adminBlog.delete')}
                  disabled={busy}
                  onClick={() =>
                    onDeletePost({
                      id: p.id,
                      slug: p.slug,
                      titleEn: p.titleEn,
                      titleAr: p.titleAr,
                    })
                  }
                >
                  {t('adminBlog.delete')}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="admin-blog">
      <Header />

      <div className="admin-blog__top">
        <div className="admin-blog__top-inner">
          <div>
            <p className="admin-blog__eyebrow">{t('adminBlog.eyebrow')}</p>
            <h1>{t('adminBlog.title')}</h1>
            <p className="admin-blog__sub">{account?.email}</p>
          </div>
          <div className="admin-blog__top-actions">
            <Link to="/blog" className="admin-blog__ghost">
              {t('adminBlog.viewBlog')}
            </Link>
            <button type="button" className="admin-blog__ghost" onClick={() => logout()}>
              {t('one.logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-blog__mobile-picker">
        <button type="button" className="admin-blog__picker-btn" onClick={() => setPostsOpen(true)}>
          <svg className="admin-blog__picker-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="admin-blog__picker-text">
            <span className="admin-blog__picker-label">{t('adminBlog.posts')}</span>
            <span className="admin-blog__picker-value">{currentLabel}</span>
          </span>
        </button>
        <button
          type="button"
          className="admin-blog__picker-new"
          onClick={() => {
            setForm(emptyForm);
            setNotice(null);
            setError(null);
          }}
        >
          +
        </button>
      </div>

      {postsOpen ? (
        <div className="admin-blog__sheet" role="dialog" aria-modal="true" aria-label={t('adminBlog.posts')}>
          <button
            type="button"
            className="admin-blog__sheet-backdrop"
            aria-label={t('adminBlog.closeList')}
            onClick={() => setPostsOpen(false)}
          />
          <div className="admin-blog__sheet-panel">
            <div className="admin-blog__sheet-head">
              <h2>{t('adminBlog.posts')}</h2>
              <button type="button" className="admin-blog__sheet-close" onClick={() => setPostsOpen(false)}>
                {t('adminBlog.closeList')}
              </button>
            </div>
            <button
              type="button"
              className="admin-blog__new admin-blog__new--sheet"
              onClick={() => {
                setForm(emptyForm);
                setNotice(null);
                setError(null);
                setPostsOpen(false);
              }}
            >
              {t('adminBlog.newPost')}
            </button>
            {renderPostList(true)}
          </div>
        </div>
      ) : null}

      <div className="admin-blog__layout">
        <aside className="admin-blog__list">
          <h2>{t('adminBlog.posts')}</h2>
          <button
            type="button"
            className="admin-blog__new"
            onClick={() => {
              setForm(emptyForm);
              setNotice(null);
              setError(null);
            }}
          >
            {t('adminBlog.newPost')}
          </button>
          {renderPostList(false)}
        </aside>

        <form className="admin-blog__form" onSubmit={onSubmit} id="admin-blog-form">
          <div className="admin-blog__form-head">
            <h2>{form.id ? t('adminBlog.editPost') : t('adminBlog.newPostEditor')}</h2>
            {form.id ? (
              <button
                type="button"
                className="admin-blog__delete-link"
                onClick={() => onDeletePost()}
                disabled={busy}
              >
                {t('adminBlog.delete')}
              </button>
            ) : null}
          </div>

          <div className="admin-blog__cover-studio">
            <span className="admin-blog__cover-label">{t('adminBlog.coverStudio')}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="admin-blog__cover-input"
              onChange={onPickCover}
            />
            <button
              type="button"
              className="admin-blog__cover-drop"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {form.coverImage ? (
                <img src={form.coverImage} alt="" className="admin-blog__cover-preview" />
              ) : (
                <span className="admin-blog__cover-placeholder">{t('adminBlog.coverTap')}</span>
              )}
              <span className="admin-blog__cover-hint">
                {uploading ? t('one.wait') : t('adminBlog.coverHint')}
              </span>
            </button>
          </div>

          <div className="admin-blog__grid">
            <label>
              <span>{t('adminBlog.slug')}</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </label>
            <label>
              <span>{t('adminBlog.status')}</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as 'published' | 'draft' })
                }
              >
                <option value="published">{t('adminBlog.published')}</option>
                <option value="draft">{t('adminBlog.draft')}</option>
              </select>
            </label>
            <label>
              <span>{t('adminBlog.readTime')}</span>
              <input
                type="number"
                min={1}
                max={60}
                value={form.readingTimeMin}
                onChange={(e) => setForm({ ...form, readingTimeMin: Number(e.target.value) })}
              />
            </label>
            <label>
              <span>{t('adminBlog.tags')}</span>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Engineering, Cloud"
              />
            </label>
          </div>

          <label>
            <span>{t('adminBlog.titleEn')}</span>
            <input
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              required
            />
          </label>
          <label>
            <span>{t('adminBlog.titleAr')}</span>
            <input
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              required
              dir="rtl"
            />
          </label>
          <label>
            <span>{t('adminBlog.excerptEn')}</span>
            <textarea
              value={form.excerptEn}
              onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
              required
              rows={3}
            />
          </label>
          <label>
            <span>{t('adminBlog.excerptAr')}</span>
            <textarea
              value={form.excerptAr}
              onChange={(e) => setForm({ ...form, excerptAr: e.target.value })}
              required
              rows={3}
              dir="rtl"
            />
          </label>
          <label>
            <span>{t('adminBlog.bodyAr')}</span>
            <textarea
              value={form.bodyAr}
              onChange={(e) => setForm({ ...form, bodyAr: e.target.value })}
              required
              rows={10}
              dir="rtl"
              placeholder={t('adminBlog.bodyArHint')}
            />
          </label>

          {notice ? <p className="admin-blog__notice">{notice}</p> : null}
          {error ? <p className="admin-blog__error">{error}</p> : null}

          <button type="submit" className="admin-blog__submit admin-blog__submit--inline" disabled={busy}>
            {busy ? t('one.wait') : t('adminBlog.publish')}
          </button>
        </form>
      </div>

      <div className="admin-blog__bar">
        <button type="submit" form="admin-blog-form" className="admin-blog__submit" disabled={busy}>
          {busy ? t('one.wait') : t('adminBlog.publish')}
        </button>
      </div>

      <Footer />
    </div>
  );
}
