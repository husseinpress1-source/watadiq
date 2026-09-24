import { applyCors, preflightResponse } from '../../../_cors.js';

export async function onRequestOptions(context) {
  return preflightResponse(context.request);
}

export async function onRequestGet(context) {
  const bucket = context.env.BLOG_MEDIA;
  if (!bucket) return new Response('Not configured', { status: 503 });

  const segments = context.params.path;
  const key = Array.isArray(segments) ? segments.join('/') : String(segments || '');
  if (!key || key.includes('..') || key.startsWith('/')) {
    return new Response('Not found', { status: 404 });
  }

  const obj = await bucket.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'image/webp');
  headers.set('Cache-Control', obj.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable');
  applyCors(headers, context.request);

  return new Response(obj.body, { headers });
}
