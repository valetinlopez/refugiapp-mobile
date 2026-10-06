/*
 * Generates the runtime brand assets (WebP + PNG fallback) from the master
 * vector sources in docs/brand-assets/sources.
 *
 * Run: node scripts/generate-brand-assets.mjs
 *
 * Produces:
 * - assets/images/brand/hero-rescued-dog@Nx.{webp,png}
 * - assets/images/brand/brand-leaf-mark@Nx.{webp,png}
 * - assets/images/brand/leaf-texture-tile@Nx.{webp,png}
 *
 * Strategy:
 * - WebP (lossless) is the primary format: flat vector colors stay crisp and
 *   the file stays small. A quantized PNG-8 is emitted as a decode fallback.
 * - Densities @1x/@2x/@3x follow the token-based sizes used by the UI; the
 *   runtime resolver (assets/images/brand) picks the best source per scale.
 * - Output is deterministic so the PR diff is reviewable.
 */

import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SOURCES = join(ROOT, 'docs', 'brand-assets', 'sources');
const OUT = join(ROOT, 'assets', 'images', 'brand');

const BRAND_ACCENT = '#B9DB62';

const ASSETS = {
  'hero-rescued-dog': { scale: 3, base: 360 },
  'brand-leaf-mark': { scale: 3, base: 48 },
  'leaf-texture-tile': { scale: 3, base: 80 },
};

/** @param {number} bytes */
function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function generate() {
  mkdirSync(OUT, { recursive: true });

  const report = [];

  for (const [name, { scale, base }] of Object.entries(ASSETS)) {
    const svgPath = join(SOURCES, `${name}.svg`);
    const svg = readFileSync(svgPath);
    const sizes = Array.from({ length: scale }, (_, index) => base * (index + 1));

    for (const size of sizes) {
      const image = sharp(svg, { density: 300 }).resize({ width: size, height: size });

      const webpLossless = await image.clone().webp({ lossless: true, effort: 6 }).toBuffer();
      const webpLossy = await image
        .clone()
        .webp({ lossless: false, quality: 86, alphaQuality: 100, effort: 6 })
        .toBuffer();
      const webp = webpLossless.byteLength <= webpLossy.byteLength ? webpLossless : webpLossy;

      const webpPath = join(OUT, `${name}@${size / base}x.webp`);
      writeFileSync(webpPath, webp);
      report.push([basename(webpPath), formatBytes(webp.byteLength), '—', '—']);
    }

    // A single PNG fallback (highest density) is enough: it only serves as a
    // decode fallback when the primary format is not supported.
    const png = await sharp(svg, { density: 300 })
      .resize({ width: sizes[scale - 1] ?? base * scale, height: sizes[scale - 1] ?? base * scale })
      .png({ palette: true, compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    const pngPath = join(OUT, `${name}.png`);
    writeFileSync(pngPath, png);
    report.push([basename(pngPath), formatBytes(png.byteLength), 'fallback', 'máx densidad']);

    const svgSize = statSync(svgPath).size;
    report.push([`source: ${basename(svgPath)}`, formatBytes(svgSize), '—', '—']);
  }

  console.log('Generated brand assets');
  console.log('  format: WebP (lossless) primary + PNG-8 fallback');
  console.log(`  accent handled: #${BRAND_ACCENT.slice(1)}`);
  console.table([...report]);
}

generate().catch((error) => {
  console.error('Failed to generate brand assets:', error);
  process.exitCode = 1;
});
