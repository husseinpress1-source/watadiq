import express from 'express';
import cors from 'cors';
import dns from 'node:dns/promises';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://watadiq.com,https://www.watadiq.com')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);
app.use(express.json());

const POPULAR_TLDS = ['com', 'net', 'org', 'io', 'dev', 'co', 'iq', 'me', 'shop', 'store'];

const TLD_PRICES_USD = {
  com: 12,
  net: 13,
  org: 11,
  io: 35,
  dev: 14,
  co: 28,
  iq: 65,
  me: 18,
  shop: 15,
  store: 15,
};

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'watad-admin-2026';
const ORDER_STATUSES = ['pending', 'processing', 'registered', 'cancelled'];

let writeQueue = Promise.resolve();

async function readOrders() {
  try {
    const raw = await readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  writeQueue = writeQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  });
  return writeQueue;
}

function generateOrderId() {
  return `WT-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function publicOrder(order) {
  return {
    id: order.id,
    domain: order.domain,
    years: order.years,
    total: order.total,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
    statusHistory: order.statusHistory,
  };
}

async function readAccounts() {
  try {
    const raw = await readFile(ACCOUNTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  writeQueue = writeQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf8');
  });
  return writeQueue;
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function createSession(account) {
  const token = randomBytes(24).toString('hex');
  account.sessions = (account.sessions || []).filter((s) => Date.now() < s.expiresAt);
  account.sessions.push({ token, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

async function accountFromRequest(req) {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;

  const accounts = await readAccounts();
  const account = accounts.find((a) =>
    (a.sessions || []).some((s) => s.token === token && Date.now() < s.expiresAt),
  );
  return account || null;
}

function publicAccount(account) {
  return {
    fullName: account.fullName,
    email: account.email,
    phone: account.phone || '',
    createdAt: account.createdAt,
  };
}

function generateApiKey() {
  return `wt_live_${randomBytes(24).toString('hex')}`;
}

function maskApiKey(key) {
  return `wt_live_••••${key.slice(-4)}`;
}

function publicApiKey(apiKey) {
  return {
    id: apiKey.id,
    name: apiKey.name,
    maskedKey: maskApiKey(apiKey.key),
    createdAt: apiKey.createdAt,
    lastUsedAt: apiKey.lastUsedAt || null,
    requests: apiKey.requests || 0,
  };
}

async function findAccountByApiKey(key) {
  if (typeof key !== 'string' || !key.startsWith('wt_live_')) return null;
  const accounts = await readAccounts();
  for (const account of accounts) {
    const found = (account.apiKeys || []).find((k) => k.key === key && !k.revokedAt);
    if (found) return { account, apiKey: found };
  }
  return null;
}

const apiKeyBuckets = new Map();
const API_KEY_RATE_LIMIT = 120;

function rateLimitApiKey(keyId) {
  const now = Date.now();
  const bucket = apiKeyBuckets.get(keyId) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  apiKeyBuckets.set(keyId, bucket);
  return bucket.count <= API_KEY_RATE_LIMIT;
}

const RDAP_FALLBACK = {
  com: 'https://rdap.verisign.com/com/v1/',
  net: 'https://rdap.verisign.com/net/v1/',
  org: 'https://rdap.publicinterestregistry.org/rdap/',
  io: 'https://rdap.identitydigital.services/rdap/',
};

let rdapBootstrap = { ...RDAP_FALLBACK };

async function loadIanaBootstrap() {
  try {
    const response = await fetch('https://data.iana.org/rdap/dns.json', {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return;

    const data = await response.json();
    for (const service of data.services || []) {
      const [tlds, urls] = service;
      const base = urls?.find((url) => url.startsWith('https://'));
      if (!base) continue;
      for (const tld of tlds) {
        rdapBootstrap[tld] = base.endsWith('/') ? base : `${base}/`;
      }
    }
    console.log(`[watad-api] IANA RDAP bootstrap loaded (${Object.keys(rdapBootstrap).length} TLDs)`);
  } catch {
    console.warn('[watad-api] IANA bootstrap failed, using fallback list');
  }
}

loadIanaBootstrap();

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value) {
  if (cache.size > 500) cache.clear();
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

function isValidDomainName(name) {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(name);
}

async function rdapLookup(fullDomain, tld) {
  const urls = [
    rdapBootstrap[tld] ? `${rdapBootstrap[tld]}domain/${fullDomain}` : null,
    `https://rdap.org/domain/${fullDomain}`,
  ].filter(Boolean);

  for (const url of urls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: 'application/rdap+json, application/json' },
      });

      clearTimeout(timeout);

      if (response.status === 404) return 'available';

      if (response.ok) {
        const body = await response.json().catch(() => null);
        if (body && (body.errorCode === 404 || /not found|no entries/i.test(String(body.title || '')))) {
          return 'available';
        }
        if (body && body.objectClassName === 'domain') return 'taken';
        if (body && (body.ldhName || body.handle)) return 'taken';
        continue;
      }
    } catch {
      clearTimeout(timeout);
    }
  }

  return 'unknown';
}

const dnsResolver = new dns.Resolver({ servers: ['1.1.1.1', '8.8.8.8'] });

async function dohLookup(fullDomain) {
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(fullDomain)}&type=NS`,
    `https://dns.google/resolve?name=${encodeURIComponent(fullDomain)}&type=NS`,
  ];

  for (const url of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: 'application/dns-json' },
      });
      clearTimeout(timeout);

      if (!response.ok) continue;

      const data = await response.json();
      if (data.Status === 3) return 'likely-available';
      if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) return 'taken';
      if (data.Status === 0) return 'likely-available';
    } catch {
      clearTimeout(timeout);
    }
  }

  return null;
}

async function dnsFallback(fullDomain) {
  const doh = await dohLookup(fullDomain);
  if (doh) return doh;

  const attempts = [dns.resolveNs(fullDomain), dnsResolver.resolveNs(fullDomain)];

  for (const attempt of attempts) {
    try {
      const ns = await Promise.race([
        attempt,
        new Promise((_, reject) => setTimeout(() => reject(new Error('dns-timeout')), 4000)),
      ]);
      if (Array.isArray(ns) && ns.length > 0) return 'taken';
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') return 'likely-available';
    }
  }

  return 'unknown';
}

async function checkOne(fullDomain, tld) {
  const cacheKey = fullDomain.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  let status;

  if (rdapBootstrap[tld]) {
    status = await rdapLookup(fullDomain, tld);
    if (status === 'unknown') {
      status = await dnsFallback(fullDomain);
    }
  } else {
    status = await dnsFallback(fullDomain);
  }

  const result = { domain: fullDomain, tld, status };
  setCached(cacheKey, result);
  return result;
}

const rateBuckets = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;

app.use('/api/check-domain', (req, res, next) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const bucket = rateBuckets.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };

  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_WINDOW_MS;
  }

  bucket.count += 1;
  rateBuckets.set(ip, bucket);

  if (bucket.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'rate-limited', message: 'Too many checks. Wait a minute.' });
  }
  return next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'watad-api', time: new Date().toISOString() });
});

app.get('/api/check-domain', async (req, res) => {
  const rawName = String(req.query.name || '').trim().toLowerCase();

  if (!rawName) {
    return res.status(400).json({ error: 'missing-name', message: 'Domain name is required.' });
  }

  const cleaned = rawName
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');

  const [namePart, ...tldParts] = cleaned.split('.');
  const requestedTld = tldParts.length ? tldParts.join('.') : null;

  if (!isValidDomainName(namePart)) {
    return res.status(400).json({ error: 'invalid-name', message: 'Invalid domain name.' });
  }

  const tlds = requestedTld ? [requestedTld] : POPULAR_TLDS;

  try {
    const results = await Promise.allSettled(
      tlds.map((tld) => checkOne(`${namePart}.${tld}`, tld)),
    );

    const payload = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    return res.json({ query: namePart, checkedAt: new Date().toISOString(), results: payload });
  } catch (error) {
    console.error('check-domain failed:', error);
    return res.status(502).json({ error: 'lookup-failed', message: 'Domain lookup failed. Try again.' });
  }
});

app.get('/api/domain-pricing', (_req, res) => {
  res.json({ currency: 'USD', prices: TLD_PRICES_USD });
});

const authRateBuckets = new Map();

function rateLimitAuth(req, res) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const bucket = authRateBuckets.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  authRateBuckets.set(ip, bucket);
  if (bucket.count > 15) {
    res.status(429).json({ error: 'rate-limited' });
    return false;
  }
  return true;
}

app.post('/api/auth/register', async (req, res) => {
  if (!rateLimitAuth(req, res)) return;

  const { fullName, email, password, phone } = req.body || {};
  const cleanName = String(fullName || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').trim();
  const pwd = String(password || '');

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ error: 'invalid-name' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'invalid-email' });
  }
  if (pwd.length < 8 || pwd.length > 100) {
    return res.status(400).json({ error: 'weak-password' });
  }

  const accounts = await readAccounts();
  if (accounts.some((a) => a.email === cleanEmail)) {
    return res.status(409).json({ error: 'email-exists' });
  }

  const salt = randomBytes(16).toString('hex');
  const account = {
    id: randomBytes(8).toString('hex'),
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    salt,
    passwordHash: hashPassword(pwd, salt),
    createdAt: new Date().toISOString(),
    sessions: [],
  };

  const token = createSession(account);
  accounts.push(account);
  await saveAccounts(accounts);

  console.log(`[watad-api] new Watad ONE account: ${account.email}`);

  return res.status(201).json({ token, account: publicAccount(account) });
});

app.post('/api/auth/login', async (req, res) => {
  if (!rateLimitAuth(req, res)) return;

  const { email, password } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const pwd = String(password || '');

  const accounts = await readAccounts();
  const account = accounts.find((a) => a.email === cleanEmail);

  if (!account || !verifyPassword(pwd, account.salt, account.passwordHash)) {
    return res.status(401).json({ error: 'wrong-credentials' });
  }

  const token = createSession(account);
  await saveAccounts(accounts);

  return res.json({ token, account: publicAccount(account) });
});

app.get('/api/auth/me', async (req, res) => {
  const account = await accountFromRequest(req);
  if (!account) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return res.json({ account: publicAccount(account) });
});

app.post('/api/auth/logout', async (req, res) => {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.json({ ok: true });

  const accounts = await readAccounts();
  const account = accounts.find((a) => (a.sessions || []).some((s) => s.token === token));
  if (account) {
    account.sessions = account.sessions.filter((s) => s.token !== token);
    await saveAccounts(accounts);
  }
  return res.json({ ok: true });
});

app.get('/api/auth/my-orders', async (req, res) => {
  const account = await accountFromRequest(req);
  if (!account) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const orders = await readOrders();
  const mine = orders
    .filter((o) => o.accountId === account.id || o.email === account.email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(publicOrder);

  return res.json({ orders: mine });
});

const orderRateBuckets = new Map();

app.post('/api/domain-orders', async (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const bucket = orderRateBuckets.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  orderRateBuckets.set(ip, bucket);
  if (bucket.count > 10) {
    return res.status(429).json({ error: 'rate-limited', message: 'Too many orders. Wait a minute.' });
  }

  const { domain, years, fullName, email, phone, notes } = req.body || {};

  const cleanDomain = String(domain || '').trim().toLowerCase();
  const yearsNum = Number(years);
  const cleanName = String(fullName || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').trim();

  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/i.test(cleanDomain)) {
    return res.status(400).json({ error: 'invalid-domain' });
  }
  if (!Number.isInteger(yearsNum) || yearsNum < 1 || yearsNum > 10) {
    return res.status(400).json({ error: 'invalid-years' });
  }
  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ error: 'invalid-name' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'invalid-email' });
  }
  if (cleanPhone.length < 7 || cleanPhone.length > 20) {
    return res.status(400).json({ error: 'invalid-phone' });
  }

  const tld = cleanDomain.split('.').pop();
  const pricePerYear = TLD_PRICES_USD[tld];
  if (!pricePerYear) {
    return res.status(400).json({ error: 'unsupported-tld' });
  }

  const availability = await checkOne(cleanDomain, tld);
  if (availability.status === 'taken') {
    return res.status(409).json({ error: 'domain-taken', domain: cleanDomain });
  }

  const account = await accountFromRequest(req);

  const order = {
    id: generateOrderId(),
    accountId: account ? account.id : null,
    domain: cleanDomain,
    years: yearsNum,
    pricePerYear,
    total: pricePerYear * yearsNum,
    currency: 'USD',
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    notes: String(notes || '').slice(0, 500),
    status: 'pending',
    createdAt: new Date().toISOString(),
    statusHistory: [{ status: 'pending', at: new Date().toISOString() }],
  };

  const orders = await readOrders();
  orders.push(order);
  await saveOrders(orders);

  console.log(`[watad-api] new order ${order.id} for ${order.domain} (${order.fullName})`);

  return res.status(201).json({ order: publicOrder(order) });
});

app.get('/api/domain-orders/:id', async (req, res) => {
  const id = String(req.params.id || '').trim().toUpperCase();
  const orders = await readOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'order-not-found' });
  }

  return res.json({ order: publicOrder(order) });
});

function requireAdmin(req, res, next) {
  const token = req.get('x-admin-token');
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return next();
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'wrong-password' });
  }
  return res.json({ ok: true, token: ADMIN_TOKEN });
});

app.get('/api/admin/domain-orders', requireAdmin, async (_req, res) => {
  const orders = await readOrders();
  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ orders: sorted });
});

app.patch('/api/admin/domain-orders/:id', requireAdmin, async (req, res) => {
  const id = String(req.params.id || '').trim().toUpperCase();
  const { status } = req.body || {};

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'invalid-status' });
  }

  const orders = await readOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'order-not-found' });
  }

  order.status = status;
  order.statusHistory.push({ status, at: new Date().toISOString() });
  await saveOrders(orders);

  return res.json({ order });
});

app.listen(PORT, () => {
  console.log(`[watad-api] listening on http://localhost:${PORT}`);
});
