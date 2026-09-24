import { adminJson, errorJson } from '../../../_blog.js';
import { requireBlogAdmin } from '../../../_blogAdmin.js';

export async function onRequestPost(context) {
  const gate = await requireBlogAdmin(context);
  if (gate.error) return gate.error;

  const db = context.env.DB;

  let body;
  try {
    body = await context.request.json();
  } catch {
    return errorJson('Invalid JSON', 400);
  }

  const id = String(body.id || '').trim();
  const slug = String(body.slug || '')
    .trim()
    .toLowerCase();

  if (!id && !slug) {
    return errorJson('Post id or slug is required', 400);
  }

  let changes = 0;

  if (slug) {
    const bySlug = await db.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
    changes = bySlug.meta?.changes ?? 0;
  }

  if (!changes && id) {
    const byId = await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    changes = byId.meta?.changes ?? 0;
  }

  if (!changes) {
    return errorJson('Post not found', 404);
  }

  return adminJson({ ok: true, id: id || null, slug: slug || null });
}
