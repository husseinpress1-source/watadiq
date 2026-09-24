/** Blog cover — smaller file, same proportions (never stretch). */
const COVER_MAX_EDGE = 1280;
const COVER_TARGET_BYTES = 140_000;
const COVER_TINY_BYTES = 80_000;

function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('webp-failed'))),
      'image/webp',
      quality,
    );
  });
}

/** Uniform scale so the image fits inside maxEdge × maxEdge — aspect ratio unchanged. */
function fitDimensions(srcW: number, srcH: number, maxEdge: number) {
  if (srcW <= maxEdge && srcH <= maxEdge) {
    return { w: srcW, h: srcH };
  }
  const scale = Math.min(maxEdge / srcW, maxEdge / srcH);
  return {
    w: Math.max(1, Math.round(srcW * scale)),
    h: Math.max(1, Math.round(srcH * scale)),
  };
}

export async function compressImageToWebp(
  file: File,
  opts?: { maxWidth?: number; quality?: number },
): Promise<Blob> {
  if (file.type === 'image/webp' && file.size <= COVER_TINY_BYTES) {
    return file;
  }

  const maxEdge = opts?.maxWidth ?? COVER_MAX_EDGE;

  const bitmap = await createImageBitmap(file, {
    resizeWidth: maxEdge,
    resizeQuality: 'high',
  });

  const { w, h } = fitDimensions(bitmap.width, bitmap.height, maxEdge);

  let canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('canvas');
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = opts?.quality ?? 0.82;
  let blob = await canvasToWebp(canvas, quality);

  while (blob.size > COVER_TARGET_BYTES && quality > 0.62) {
    quality -= 0.05;
    blob = await canvasToWebp(canvas, quality);
  }

  while (blob.size > COVER_TARGET_BYTES && Math.max(canvas.width, canvas.height) > 720) {
    const nw = Math.max(1, Math.round(canvas.width * 0.9));
    const nh = Math.max(1, Math.round(canvas.height * 0.9));
    const next = document.createElement('canvas');
    next.width = nw;
    next.height = nh;
    const nctx = next.getContext('2d');
    if (!nctx) break;
    nctx.drawImage(canvas, 0, 0, nw, nh);
    canvas = next;
    blob = await canvasToWebp(canvas, quality);
  }

  return blob;
}

export function htmlBodyToPlain(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function plainToHtmlBody(text: string): string {
  const t = text.trim();
  if (!t) return '';
  if (/<p[\s>]/i.test(t) || /<h[1-6]/i.test(t)) return t;
  return t
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p.replace(/\n/g, ' '))}</p>`)
    .join('');
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function excerptToBodyEn(excerpt: string): string {
  const t = excerpt.trim();
  if (!t) return '<p></p>';
  return `<p>${escapeHtml(t)}</p>`;
}
