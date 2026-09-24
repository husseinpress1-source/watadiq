const SESSION_COOKIE = 'watad_session';
const SESSION_DAYS = 30;
/** Workers CPU budget — keep PBKDF2 fast enough for Pages Functions */
const PBKDF2_ITERATIONS = 10_000;

export function adminEmail(env) {
  return String(env.ADMIN_EMAIL || 'hswnbrys@gmail.com').trim().toLowerCase();
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export function errorJson(message, status = 400, code) {
  return json({ error: code || message, message }, status);
}

function toB64(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return { hash: toB64(new Uint8Array(bits)), salt: toB64(salt) };
}

export async function verifyPassword(password, saltB64, hashB64) {
  const salt = fromB64(saltB64);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  const actual = toB64(new Uint8Array(bits));
  return timingSafeEqual(actual, hashB64);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function newToken() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

export function sessionExpiryIso() {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d.toISOString();
}

export function parseCookies(request) {
  const raw = request.headers.get('Cookie') || '';
  const out = {};
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('='));
  }
  return out;
}

export function sessionCookieHeader(token, expiresAt) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function bearerToken(request) {
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  const cookies = parseCookies(request);
  return cookies[SESSION_COOKIE] || null;
}

export async function getUserFromRequest(db, request) {
  const token = bearerToken(request);
  if (!token || !db) return null;
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')
       LIMIT 1`,
    )
    .bind(token)
    .first();
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function ensureAdminUser(db, env) {
  const email = adminEmail(env);
  const password = String(env.WATAD_ADMIN_PASSWORD || '').trim();
  if (!password || !db) return;

  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return;

  const { hash, salt } = await hashPassword(password);
  const id = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  await db
    .prepare(
      `INSERT INTO users (id, email, full_name, password_hash, password_salt, role)
       VALUES (?, ?, 'WATAD Admin', ?, ?, 'admin')`,
    )
    .bind(id, email, hash, salt)
    .run();
}

export async function createSession(db, userId) {
  const token = newToken();
  const expiresAt = sessionExpiryIso();
  await db
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expiresAt)
    .run();
  return { token, expiresAt };
}

export function rateLimitAuth(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  // Simple in-memory not available on workers — rely on CF rate limiting in prod
  void ip;
  void env;
  return true;
}
