import { ensureAdminUser, errorJson, json } from '../../_auth.js';
import { generateResetCode, saveResetCode } from '../../_reset.js';
import { sendPasswordResetEmail } from '../../_resend.js';

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorJson('invalid-email', 400, 'invalid-email');
  }

  const user = await db.prepare('SELECT id, full_name FROM users WHERE email = ?').bind(email).first();

  if (user) {
    const code = generateResetCode();
    await saveResetCode(db, email, code);
    const sent = await sendPasswordResetEmail(context.env, { to: email, code });
    if (sent.skipped) {
      return errorJson('email-not-configured', 503, 'email-not-configured');
    }
    if (!sent.ok) {
      console.error('password reset email failed for', email);
      return errorJson('email-failed', 502, 'email-failed');
    }
  }

  return json({
    ok: true,
    message: 'If an account exists for this email, we sent a reset code.',
  });
}
