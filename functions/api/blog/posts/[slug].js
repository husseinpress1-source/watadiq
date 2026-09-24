import { errorJson, json, getPublishedPostBySlug } from '../../../_blog.js';

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return errorJson('Blog database is not configured', 503);
  }

  const slug = context.params.slug;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return errorJson('Invalid slug', 400);
  }

  try {
    const post = await getPublishedPostBySlug(db, slug, context.env);
    if (!post) {
      return errorJson('Post not found', 404);
    }
    return json({ post });
  } catch (err) {
    console.error('get post', err);
    return errorJson('Failed to load post', 500);
  }
}
