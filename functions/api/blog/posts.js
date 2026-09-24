import { errorJson, json, listPublishedPosts } from '../../_blog.js';

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return errorJson('Blog database is not configured', 503);
  }

  const url = new URL(context.request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 24, 1), 50);
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

  try {
    const posts = await listPublishedPosts(db, { limit, offset, env: context.env });
    return json({ posts, limit, offset });
  } catch (err) {
    console.error('list posts', err);
    return errorJson('Failed to load posts', 500);
  }
}
