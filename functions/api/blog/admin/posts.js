import { adminJson, errorJson, mapPost } from '../../../_blog.js';
import { publicCoverUrl } from '../../../_blogMedia.js';
import { requireBlogAdmin } from '../../../_blogAdmin.js';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function excerptToBodyEn(excerpt) {
  const t = String(excerpt || '').trim();
  if (!t) return '';
  return `<p>${escapeHtml(t)}</p>`;
}

function newId() {
  return `post_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function parseTags(raw) {
  if (Array.isArray(raw)) return JSON.stringify(raw);
  if (typeof raw === 'string') {
    try {
      JSON.parse(raw);
      return raw;
    } catch {
      return JSON.stringify(
        raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return '[]';
}

export async function onRequestGet(context) {
  const gate = await requireBlogAdmin(context);
  if (gate.error) return gate.error;

  const db = context.env.DB;
  const { results } = await db
    .prepare(
      `SELECT id, slug, status, published_at, cover_image, reading_time_min, author_name, tags,
              title_en, title_ar, excerpt_en, excerpt_ar, updated_at
       FROM posts ORDER BY updated_at DESC LIMIT 100`,
    )
    .all();

  return adminJson({
    posts: (results || []).map((row) => mapPost(row, { env: context.env })),
  });
}

export async function onRequestPost(context) {
  const gate = await requireBlogAdmin(context);
  if (gate.error) return gate.error;

  const db = context.env.DB;

  let body;
  try {
    body = await context.request.json();
  } catch {
    return errorJson('Invalid JSON body', 400);
  }

  const slug = String(body.slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return errorJson('Valid slug is required', 400);
  }

  const status = body.status === 'draft' ? 'draft' : 'published';
  const publishedAt =
    status === 'published'
      ? body.publishedAt || new Date().toISOString()
      : body.publishedAt || null;

  const required = ['titleEn', 'titleAr', 'excerptEn', 'excerptAr', 'bodyAr'];
  for (const key of required) {
    if (!body[key] || !String(body[key]).trim()) {
      return errorJson(`Missing ${key}`, 400);
    }
  }

  const bodyEn =
    String(body.bodyEn || '').trim() || excerptToBodyEn(body.excerptEn);
  if (!bodyEn) return errorJson('Missing excerptEn', 400);

  const tags = parseTags(body.tags);
  const readingTimeMin = Math.min(Math.max(Number(body.readingTimeMin) || 5, 1), 60);
  const coverImage = publicCoverUrl(
    context.env,
    body.coverImage || '/images/home/highlight-2.jpg',
  );
  const authorName = body.authorName || 'WATAD Software';
  const editId = String(body.id || '').trim();

  try {
    if (editId) {
      const row = await db.prepare('SELECT id FROM posts WHERE id = ?').bind(editId).first();
      if (row) {
        await db
          .prepare(
            `UPDATE posts SET
              slug = ?, status = ?, published_at = ?, cover_image = ?, reading_time_min = ?,
              author_name = ?, tags = ?, title_en = ?, title_ar = ?, excerpt_en = ?, excerpt_ar = ?,
              body_en = ?, body_ar = ?, updated_at = datetime('now')
             WHERE id = ?`,
          )
          .bind(
            slug,
            status,
            publishedAt,
            coverImage,
            readingTimeMin,
            authorName,
            tags,
            body.titleEn,
            body.titleAr,
            body.excerptEn,
            body.excerptAr,
            bodyEn,
            body.bodyAr,
            editId,
          )
          .run();
        return adminJson({ ok: true, id: editId, slug, status });
      }
    }

    const id = newId();
    await db
      .prepare(
        `INSERT INTO posts (
          id, slug, status, published_at, cover_image, reading_time_min, author_name, tags,
          title_en, title_ar, excerpt_en, excerpt_ar, body_en, body_ar, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(slug) DO UPDATE SET
          status = excluded.status,
          published_at = excluded.published_at,
          cover_image = excluded.cover_image,
          reading_time_min = excluded.reading_time_min,
          author_name = excluded.author_name,
          tags = excluded.tags,
          title_en = excluded.title_en,
          title_ar = excluded.title_ar,
          excerpt_en = excluded.excerpt_en,
          excerpt_ar = excluded.excerpt_ar,
          body_en = excluded.body_en,
          body_ar = excluded.body_ar,
          updated_at = datetime('now')`,
      )
      .bind(
        id,
        slug,
        status,
        publishedAt,
        coverImage,
        readingTimeMin,
        authorName,
        tags,
        body.titleEn,
        body.titleAr,
        body.excerptEn,
        body.excerptAr,
        bodyEn,
        body.bodyAr,
      )
      .run();

    return adminJson({ ok: true, id, slug, status }, 201);
  } catch (err) {
    console.error('admin publish', err);
    return errorJson('Failed to save post', 500);
  }
}

export async function onRequestDelete(context) {
  const gate = await requireBlogAdmin(context);
  if (gate.error) return gate.error;

  const db = context.env.DB;
  const url = new URL(context.request.url);
  let slug = url.searchParams.get('slug')?.trim().toLowerCase();

  if (!slug) {
    try {
      const body = await context.request.json();
      slug = String(body.slug || '')
        .trim()
        .toLowerCase();
    } catch {
      /* ignore */
    }
  }

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return errorJson('Valid slug is required', 400);
  }

  const result = await db.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
  if (!result.meta?.changes) {
    return errorJson('Post not found', 404);
  }

  return adminJson({ ok: true, slug });
}
