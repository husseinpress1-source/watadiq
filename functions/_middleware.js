import { getPublishedPostBySlug } from './_blog.js';
import {
  blogSlugFromPath,
  buildBlogShareHead,
  htmlLangFromRequest,
  injectBlogShareMeta,
} from './_blogOgHtml.js';

/** Canonical host + blog OG in HTML + never serve index.html as a missing hashed asset. */
export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === 'www.watadiq.com') {
    url.hostname = 'watadiq.com';
    return Response.redirect(url.href, 301);
  }

  const path = url.pathname;
  const slug = blogSlugFromPath(path);
  if (
    slug &&
    context.request.method === 'GET' &&
    context.env.DB &&
    (context.request.headers.get('Accept') || '').includes('text/html')
  ) {
    const post = await getPublishedPostBySlug(context.env.DB, slug, context.env);
    if (post) {
      const response = await context.next();
      const ct = response.headers.get('content-type') || '';
      if (response.status === 200 && ct.includes('text/html')) {
        const lang = htmlLangFromRequest(url, context.request);
        const headBlock = buildBlogShareHead(post, { slug, lang });
        const html = injectBlogShareMeta(await response.text(), headBlock, lang);
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'text/html; charset=utf-8');
        headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        return new Response(html, { status: 200, headers });
      }
      return response;
    }
  }
  const isHashedAsset =
    path.startsWith('/assets/') &&
    /\.(css|js|mjs|map|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|gif)$/i.test(path);

  if (isHashedAsset) {
    const response = await context.next();
    const ct = response.headers.get('content-type') || '';
    if (response.status === 200 && ct.includes('text/html')) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' },
      });
    }
    return response;
  }

  return context.next();
}
