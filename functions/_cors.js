const ALLOWED_ORIGIN_EXACT = new Set([
  'https://watadiq.com',
  'https://www.watadiq.com',
  'https://watadiq-cpk.pages.dev',
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGIN_EXACT.has(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.watadiq-cpk\.pages\.dev$/i.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1):5173$/.test(origin)) return true;
  return false;
}

/** @param {Request} request */
export function corsHeadersForRequest(request, { methods = 'GET, HEAD, OPTIONS' } = {}) {
  const origin = request.headers.get('Origin');
  if (!isAllowedOrigin(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** @param {Request} request */
export function preflightResponse(request, opts) {
  const cors = corsHeadersForRequest(request, opts);
  if (!cors) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: cors });
}

/** @param {Headers} headers @param {Request} request */
export function applyCors(headers, request, opts) {
  const cors = corsHeadersForRequest(request, opts);
  if (!cors) return;
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
}
