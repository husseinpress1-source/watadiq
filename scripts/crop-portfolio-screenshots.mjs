import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Full-desktop captures: trim browser chrome (top) and Windows taskbar (bottom). */
const TOP = 44;

const srcDir = path.join(__dirname, '_portfolio-src');

const jobs = [
  {
    in: path.join(srcDir, 'victorian.jpg'),
    outBase: path.join(root, 'public/images/work/victorian-screenshot'),
    bottom: 64,
  },
  {
    in: path.join(srcDir, 'crazy.png'),
    outBase: path.join(root, 'public/images/work/crazy-screenshot'),
    bottom: 24,
  },
];

async function cropToWeb(inPath, outBase, bottom) {
  const meta = await sharp(inPath).metadata();
  const height = meta.height - TOP - bottom;
  if (height < 100) throw new Error(`Crop too aggressive for ${inPath}`);

  const piped = sharp(inPath).extract({
    left: 0,
    top: TOP,
    width: meta.width,
    height,
  });

  await piped.clone().png({ compressionLevel: 9 }).toFile(`${outBase}.png`);
  await piped.clone().webp({ quality: 88, effort: 6 }).toFile(`${outBase}.webp`);

  const outMeta = await sharp(`${outBase}.png`).metadata();
  console.log('OK', path.basename(outBase), `${outMeta.width}x${outMeta.height}`);
}

for (const job of jobs) {
  await cropToWeb(job.in, job.outBase, job.bottom);
}
