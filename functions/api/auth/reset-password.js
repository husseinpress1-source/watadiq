import { errorJson, json, hashPassword } from '../../_auth.js';
import { consumeResetCode } from '../../_reset.js';

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return errorJson('Database unavailable', 503, 'no-db');

  let body;
  try {
    body = await context.request.json();
  } catch {
    return errorJson('Invalid JSON', 400, 'invalid-json');
  }

  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const code = String(body.code || '').trim().replace(/\s/g, '');
  const password = String(body.password || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorJson('invalid-email', 400, 'invalid-email');
  }
  if (!/^\d{6}$/.test(code)) {
    return errorJson('invalid-code', 400, 'invalid-code');
  }
  if (password.length < 8 || password.length > 100) {
    return errorJson('weak-password', 400, 'weak-password');
  }

  const valid = await consumeResetCode(db, email, code);
  if (!valid) {
    return errorJson('invalid-code', 400, 'invalid-code');
  }

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) {
    return errorJson('invalid-code', 400, 'invalid-code');
  }

  const { hash, salt } = await hashPassword(password);
  await db
    .prepare(`UPDATE users SET password_hash = ?, password_salt = ? WHERE email = ?`)
    .bind(hash, salt, email)
    .run();

  await db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(user.id).run();

  return json({ ok: true });
}
