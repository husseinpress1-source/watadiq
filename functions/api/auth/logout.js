import { bearerToken, clearSessionCookieHeader, errorJson, json } from '../../_auth.js';

export async function onRequestPost(context) {
  const db = context.env.DB;
  const token = bearerToken(context.request);
  if (db && token) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookieHeader() });
}

export async function onRequestGet() {
  return errorJson('Method not allowed', 405);
}
