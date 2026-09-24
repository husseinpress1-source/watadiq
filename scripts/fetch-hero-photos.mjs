/**
 * Home hero — exact viewport ratios (desktop 16:9, mobile 9:16). Pexels license.
 * Run: node scripts/fetch-hero-photos.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const heroesDir = path.join(__dirname, '..', 'public', 'images', 'heroes');

const pexels = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`;

/** Friends walking & laughing together (mixed group, incl. darker skin tones) */
const DESKTOP_SOURCE = 4880339;
const DESKTOP_VARIANTS = [
  { file: 'hero-home-1920.webp', w: 1920, h: 1080 },
  { file: 'hero-home-1280.webp', w: 1280, h: 720 },
];

/** Two friends walking & talking — portrait 9:16 (Pexels 12886718) */
const MOBILE = { id: 12886718, file: 'hero-home-mobile.webp', w: 1080, h: 1920 };

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function exportCover(input, { file, w, h }, position = 'attention') {
  const out = path.join(heroesDir, file);
  await sharp(input)
    .resize(w, h, { fit: 'cover', position })
    .webp({ quality: 84, effort: 4 })
    .toFile(out);
  const meta = await sharp(out).metadata();
  const stat = await fs.stat(out);
  console.log(`  ✓ ${file} ${meta.width}×${meta.height} (${Math.round(stat.size / 1024)} KB)`);
}

async function main() {
  await fs.mkdir(heroesDir, { recursive: true });

  console.log('[home desktop 16:9] …');
  const desktopBuf = await fetchBuffer(pexels(DESKTOP_SOURCE));
  for (const variant of DESKTOP_VARIANTS) {
    await exportCover(desktopBuf, variant, 'centre');
  }

  console.log('[home mobile 9:16] …');
  const mobileBuf = await fetchBuffer(pexels(MOBILE.id));
  await exportCover(mobileBuf, MOBILE, 'attention');

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
