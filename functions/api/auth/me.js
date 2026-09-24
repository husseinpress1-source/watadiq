import { ensureAdminUser, errorJson, getUserFromRequest, json, publicUser } from '../../_auth.js';

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) return errorJson('Database unavailable', 503, 'no-db');

  await ensureAdminUser(db, context.env);

  const user = await getUserFromRequest(db, context.request);
  if (!user) return errorJson('unauthorized', 401, 'unauthorized');
  return json({ account: publicUser(user) });
}
