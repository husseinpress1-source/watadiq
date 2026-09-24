import { adminJson, errorJson, mapPost } from '../../../../_blog.js';
import { requireBlogAdmin } from '../../../../_blogAdmin.js';

export async function onRequestGet(context) {
  const gate = await requireBlogAdmin(context);
  if (gate.error) return gate.error;

  const db = context.env.DB;
  const slug = String(context.params.slug || '')
    .trim()
    .toLowerCase();
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return errorJson('Invalid slug', 400);
  }

  const row = await db.prepare('SELECT * FROM posts WHERE slug = ? LIMIT 1').bind(slug).first();
  if (!row) return errorJson('Post not found', 404);

  return adminJson({ post: mapPost(row, { includeBody: true, env: context.env }) });
}
