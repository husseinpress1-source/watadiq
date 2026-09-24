import { errorJson, json } from '../../../_blog.js';
import { publicCoverUrl } from '../../../_blogMedia.js';
import { requireBlogAdmin } from '../../../_blogAdmin.js';

const MAX_BYTES = 2_500_000;

export async function onRequestPost(context) {
  const gate = await requireBlogAdmin(context);
  if (gate.error) return gate.error;

  const bucket = context.env.BLOG_MEDIA;
  if (!bucket) return errorJson('Media storage is not configured', 503);

  const contentType = context.request.headers.get('Content-Type') || '';
  let bytes;

  if (contentType.includes('multipart/form-data')) {
    let formData;
    try {
      formData = await context.request.formData();
    } catch {
      return errorJson('Invalid form data', 400);
    }
    const file = formData.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return errorJson('Missing file', 400);
    }
    bytes = await file.arrayBuffer();
  } else if (contentType.startsWith('image/webp') || contentType.startsWith('image/')) {
    bytes = await context.request.arrayBuffer();
  } else {
    return errorJson('Expected WebP image upload', 400);
  }
  if (bytes.byteLength > MAX_BYTES) {
    return errorJson('File too large', 413);
  }

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const key = `covers/${id}.webp`;

  await bucket.put(key, bytes, {
    httpMetadata: {
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  return json({ ok: true, url: publicCoverUrl(context.env, key), key });
}
