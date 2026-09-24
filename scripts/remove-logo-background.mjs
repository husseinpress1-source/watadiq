import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input =
  process.argv[2] ??
  path.join(__dirname, '../public/images/watad-wordmark-ai.png');
const output = path.join(__dirname, '../public/images/watad-wordmark.png');

function isBackgroundLike(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const lum = (r + g + b) / 3;
  return lum >= 150 && chroma <= 32;
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) throw new Error('Expected RGBA');

const idx = (x, y) => (y * width + x) * 4;
const visited = new Uint8Array(width * height);
const queue = [];

function trySeed(x, y) {
  const p = idx(x, y);
  if (visited[y * width + x]) return;
  if (!isBackgroundLike(data[p], data[p + 1], data[p + 2])) return;
  visited[y * width + x] = 1;
  queue.push(x, y);
}

for (let x = 0; x < width; x++) {
  trySeed(x, 0);
  trySeed(x, height - 1);
}
for (let y = 0; y < height; y++) {
  trySeed(0, y);
  trySeed(width - 1, y);
}

while (queue.length) {
  const y = queue.pop();
  const x = queue.pop();
  const p = idx(x, y);
  data[p + 3] = 0;

  if (x > 0) trySeed(x - 1, y);
  if (x < width - 1) trySeed(x + 1, y);
  if (y > 0) trySeed(x, y - 1);
  if (y < height - 1) trySeed(x, y + 1);
}

for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] === 0) continue;
  if (isBackgroundLike(data[i], data[i + 1], data[i + 2])) {
    data[i + 3] = 0;
  }
}

const trimmed = await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .trim({ threshold: 1 })
  .toBuffer();

await sharp(trimmed).toFile(output);
const meta = await sharp(output).metadata();
console.log('OK:', output, `${meta.width}x${meta.height}`, 'from', input);
