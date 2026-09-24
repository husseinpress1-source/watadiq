import {
  createSession,
  ensureAdminUser,
  errorJson,
  json,
  publicUser,
  sessionCookieHeader,
  verifyPassword,
} from '../../_auth.js';

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return errorJson('Database unavailable', 503, 'no-db');

  await ensureAdminUser(db, context.env);

  let body;
  try {
    body = await context.request.json();
  } catch {
    return errorJson('Invalid JSON', 400, 'invalid-json');
  }

  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');

  const row = await db
    .prepare('SELECT id, email, full_name, role, password_hash, password_salt, created_at FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (!row) return errorJson('wrong-credentials', 401, 'wrong-credentials');

  const ok = await verifyPassword(password, row.password_salt, row.password_hash);
  if (!ok) return errorJson('wrong-credentials', 401, 'wrong-credentials');

  const { token, expiresAt } = await createSession(db, row.id);
  const user = {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  };

  return json(
    { account: publicUser(user), token },
    200,
    { 'Set-Cookie': sessionCookieHeader(token, expiresAt) },
  );
}
