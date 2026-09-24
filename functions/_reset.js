const RESET_TTL_MIN = 15;

export function generateResetCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, '0');
}

export function resetExpiryIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + RESET_TTL_MIN);
  return d.toISOString();
}

export async function hashResetCode(code) {
  const data = new TextEncoder().encode(code);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyResetCode(code, hash) {
  const actual = await hashResetCode(code);
  if (actual.length !== hash.length) return false;
  let out = 0;
  for (let i = 0; i < actual.length; i++) out |= actual.charCodeAt(i) ^ hash.charCodeAt(i);
  return out === 0;
}

export async function purgeExpiredResets(db) {
  await db.prepare(`DELETE FROM password_reset_codes WHERE expires_at <= datetime('now')`).run();
}

export async function saveResetCode(db, email, code) {
  await purgeExpiredResets(db);
  await db.prepare(`DELETE FROM password_reset_codes WHERE email = ?`).bind(email).run();
  const codeHash = await hashResetCode(code);
  const id = `rst_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  await db
    .prepare(
      `INSERT INTO password_reset_codes (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)`,
    )
    .bind(id, email, codeHash, resetExpiryIso())
    .run();
}

export async function consumeResetCode(db, email, code) {
  await purgeExpiredResets(db);
  const row = await db
    .prepare(
      `SELECT id, code_hash FROM password_reset_codes
       WHERE email = ? AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(email)
    .first();
  if (!row) return false;
  const ok = await verifyResetCode(code, row.code_hash);
  if (!ok) return false;
  await db.prepare(`DELETE FROM password_reset_codes WHERE id = ?`).bind(row.id).run();
  return true;
}
