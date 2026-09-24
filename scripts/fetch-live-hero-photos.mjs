/**
 * WATAD Live hero — 4K desktop + portrait mobile (Pexels license).
 * Run: node scripts/fetch-live-hero-photos.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const liveDir = path.join(__dirname, '..', 'public', 'images', 'live');

/** JPEG from Pexels CDN (3840px wide — enough for 4K export) */
const pexels = (id, w = 3840) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Cinema rows, popcorn — US/EU movie-night look (Pexels) */
const DESKTOP_PEXELS_ID = 7991136;

const DESKTOP_VARIANTS = [
  { file: 'hero-desktop-3840.webp', w: 3840, h: 2160 },
  { file: 'hero-desktop-1920.webp', w: 1920, h: 1080 },
];

/** Couple on a sofa, popcorn & streaming — portrait crop (Pexels) */
const MOBILE_PEXELS_ID = 7594055;

const MOBILE_VARIANTS = [
  { file: 'hero-mobile.webp', w: 1080, h: 1920 },
  { file: 'hero-mobile-1440.webp', w: 1440, h: 2560 },
];

async function fetchBuffer(url, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'watadiq-hero-fetch/1.0' } });
      if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function exportCover(input, { file, w, h }, position = 'attention') {
  const out = path.join(liveDir, file);
  await sharp(input)
    .rotate()
    .resize(w, h, { fit: 'cover', position })
    .webp({ quality: w >= 3000 ? 88 : 85, effort: 4 })
    .toFile(out);
  const meta = await sharp(out).metadata();
  const stat = await fs.stat(out);
  console.log(`  ✓ ${file} ${meta.width}×${meta.height} (${Math.round(stat.size / 1024)} KB)`);
}

async function main() {
  await fs.mkdir(liveDir, { recursive: true });

  console.log('[live desktop 4K / 1080p — Pexels] …');
  const desktopBuf = await fetchBuffer(pexels(DESKTOP_PEXELS_ID));
  for (const variant of DESKTOP_VARIANTS) {
    await exportCover(desktopBuf, variant, 'centre');
  }

  console.log('[live mobile 9:16 — Pexels] …');
  const mobileBuf = await fetchBuffer(pexels(MOBILE_PEXELS_ID, 3200));
  for (const variant of MOBILE_VARIANTS) {
    await exportCover(mobileBuf, variant, 'attention');
  }

  const credits = `WATAD Live hero — free stock licenses

Desktop (4K + 1080p) — Pexels ${DESKTOP_PEXELS_ID}
  People watching a film in a cinema with popcorn
  https://www.pexels.com/photo/${DESKTOP_PEXELS_ID}/
  License: https://www.pexels.com/license/

Mobile — Pexels ${MOBILE_PEXELS_ID}
  Woman eating popcorn while watching a movie at home
  https://www.pexels.com/photo/${MOBILE_PEXELS_ID}/
  License: https://www.pexels.com/license/

Regenerate: node scripts/fetch-live-hero-photos.mjs
`;
  await fs.writeFile(path.join(liveDir, 'PHOTO_CREDITS.txt'), credits, 'utf8');

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
