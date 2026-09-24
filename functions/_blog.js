/** @typedef {import('@cloudflare/workers-types').D1Database} D1Database */

import { publicCoverUrl } from './_blogMedia.js';

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      ...extraHeaders,
    },
  });
}

export function errorJson(message, status = 400) {
  return json({ error: message }, status, { 'Cache-Control': 'no-store' });
}

/** Admin / mutating blog APIs — never cache (stale lists after delete). */
export function adminJson(data, status = 200) {
  return json(data, status, { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' });
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapPost(row, { includeBody = false, env } = {}) {
  let tags = [];
  try {
    tags = JSON.parse(String(row.tags || '[]'));
  } catch {
    tags = [];
  }

  const base = {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    coverImage: publicCoverUrl(env, row.cover_image),
    readingTimeMin: row.reading_time_min,
    authorName: row.author_name,
    tags,
    titleEn: row.title_en,
    titleAr: row.title_ar,
    excerptEn: row.excerpt_en,
    excerptAr: row.excerpt_ar,
    updatedAt: row.updated_at,
  };

  if (includeBody) {
    return {
      ...base,
      bodyEn: row.body_en,
      bodyAr: row.body_ar,
    };
  }
  return base;
}

/** @param {D1Database} db */
export async function listPublishedPosts(db, { limit = 24, offset = 0, env } = {}) {
  const stmt = db.prepare(
    `SELECT id, slug, status, published_at, cover_image, reading_time_min, author_name, tags,
            title_en, title_ar, excerpt_en, excerpt_ar, updated_at
     FROM posts
     WHERE status = 'published'
     ORDER BY published_at DESC
     LIMIT ? OFFSET ?`,
  );
  const { results } = await stmt.bind(limit, offset).all();
  return (results || []).map((row) => mapPost(row, { env }));
}

/** @param {D1Database} db */
export async function getPublishedPostBySlug(db, slug, env) {
  const row = await db
    .prepare(
      `SELECT *
       FROM posts
       WHERE slug = ? AND status = 'published'
       LIMIT 1`,
    )
    .bind(slug)
    .first();
  if (!row) return null;
  return mapPost(row, { includeBody: true, env });
}
