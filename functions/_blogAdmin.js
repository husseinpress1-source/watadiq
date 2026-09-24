import { errorJson } from './_blog.js';
import { bearerToken, getUserFromRequest } from './_auth.js';

export async function requireBlogAdmin(context) {
  const db = context.env.DB;
  if (!db) return { error: errorJson('Blog database is not configured', 503) };

  const user = await getUserFromRequest(db, context.request);
  if (user?.role === 'admin') return { user };

  const secret = context.env.BLOG_ADMIN_SECRET;
  const auth = context.request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : bearerToken(context.request);
  if (secret && token === secret) return { user: null };

  return { error: errorJson('Unauthorized', 401) };
}
