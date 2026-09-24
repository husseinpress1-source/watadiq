import {
  createSession,
  errorJson,
  hashPassword,
  json,
  publicUser,
  sessionCookieHeader,
} from '../../_auth.js';
import { sendWelcomeEmail } from '../../_resend.js';

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return errorJson('Database unavailable', 503, 'no-db');

  let body;
  try {
    body = await context.request.json();
  } catch {
    return errorJson('Invalid JSON', 400, 'invalid-json');
  }

  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');

  if (fullName.length < 2 || fullName.length > 100) {
    return errorJson('invalid-name', 400, 'invalid-name');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorJson('invalid-email', 400, 'invalid-email');
  }
  if (password.length < 8 || password.length > 100) {
    return errorJson('weak-password', 400, 'weak-password');
  }

  const adminMail = (context.env.ADMIN_EMAIL || 'hswnbrys@gmail.com').toLowerCase();
  if (email === adminMail) {
    return errorJson('Use admin sign-in for this email', 403, 'admin-email-reserved');
  }

  const exists = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (exists) return errorJson('email-exists', 409, 'email-exists');

  const { hash, salt } = await hashPassword(password);
  const id = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

  await db
    .prepare(
      `INSERT INTO users (id, email, full_name, password_hash, password_salt, role)
       VALUES (?, ?, ?, ?, ?, 'user')`,
    )
    .bind(id, email, fullName, hash, salt)
    .run();

  await sendWelcomeEmail(context.env, { to: email, name: fullName });

  const { token, expiresAt } = await createSession(db, id);
  const user = { id, email, fullName, role: 'user', createdAt: new Date().toISOString() };

  return json(
    { account: publicUser(user), token },
    201,
    { 'Set-Cookie': sessionCookieHeader(token, expiresAt) },
  );
}
