/**
 * Sign-in hero — diverse team, clear faces. Pexels license.
 * Run: node scripts/fetch-auth-signin-photos.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'images', 'auth');

const pexels = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`;

/** Friends laughing together — clear faces, diverse incl. brown skin (Pexels 4880339) */
const DESKTOP_ID = 4880339;
const VARIANTS = [
  { file: 'sign-in-hero-1920.webp', w: 1920, h: 1200 },
  { file: 'sign-in-hero-1280.webp', w: 1280, h: 960 },
  { file: 'sign-in-mobile.webp', w: 1080, h: 1350 },
];

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function exportCover(input, { file, w, h }) {
  const out = path.join(outDir, file);
  await sharp(input)
    .resize(w, h, { fit: 'cover', position: 'attention' })
    .webp({ quality: 86, effort: 4 })
    .toFile(out);
  const stat = await fs.stat(out);
  console.log(`  ✓ ${file} (${Math.round(stat.size / 1024)} KB)`);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const buf = await fetchBuffer(pexels(DESKTOP_ID));
  for (const v of VARIANTS) await exportCover(buf, v);
  await fs.writeFile(
    path.join(outDir, 'PHOTO_CREDITS.txt'),
    `Sign-in hero — Pexels 4880339 (free license)\nhttps://www.pexels.com/photo/4880339/\nRegenerate: node scripts/fetch-auth-signin-photos.mjs\n`,
    'utf8',
  );
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
