/*
 * Generates the runtime brand assets (WebP + PNG fallback) from the masters
 * in docs/brand-assets/sources:
 *  - vector assets (brand-leaf-mark, leaf-texture-tile) -> SVG sources
 *  - photoreal hero (hero-rescued-dog) -> raster PNG source (Pngtree, licensed,
 *    trimmed and centered on a square transparent canvas, see
 *    docs/brand-assets.md)
 *
 * Run: node scripts/generate-brand-assets.mjs  (or npm run assets:brand)
 *
 * Produces:
 * - assets/images/brand/hero-rescued-dog@Nx.webp + hero-rescued-dog.png
 * - assets/images/brand/brand-leaf-mark@Nx.webp + brand-leaf-mark.png
 * - assets/images/brand/leaf-texture-tile@Nx.webp + leaf-texture-tile.png
 *
 * Strategy:
 * - Vector assets: WebP primary picking the smaller of lossless/lossy per
 *   density, plus a quantized PNG-8 fallback at max density.
 * - Raster hero: a single high-res WebP @3x (expo-image downscales for lower
 *   densities; keeps quality and bounds the bundled weight) plus a PNG-8
 *   fallback reduced to a low-fidelity safety net for platforms without WebP.
 * - Output is deterministic so the PR diff is reviewable.
 */

import { mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SOURCES = join(ROOT, 'docs', 'brand-assets', 'sources');
const OUT = join(ROOT, 'assets', 'images', 'brand');

/** Vector masters in docs/brand-assets/sources. */
const VECTOR_ASSETS = {
  'brand-leaf-mark': { base: 48, densities: [1, 2, 3] },
  'leaf-texture-tile': { base: 80, densities: [1, 2, 3] },
};

/** Raster masters (PNG, transparent, already square). */
const RASTER_ASSETS = {
  'hero-rescued-dog': {
    source: 'hero-rescued-dog-source.png',
    base: 360,
    densities: [3],
    webpQuality: 82,
    fallbackSize: 360,
  },
};

/** @param {number} bytes */
function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function sizesFor(base, densities) {
  return densities.map((density) => ({ density, size: base * density }));
}

function svgSource(sourcesDir, name) {
  return sharp(readFileSync(join(sourcesDir, `${name}.svg`)), { density: 300 });
}

function rasterSource(sourcesDir, config) {
  return sharp(join(sourcesDir, config.source));
}

async function generate() {
  mkdirSync(OUT, { recursive: true });

  // Deterministic output: remove stale density artifacts before regenerating.
  const existing = readdirSync(OUT);
  for (const file of existing) {
    if (/\.(webp|png)$/.test(file) && file !== 'assets.d.ts') {
      unlinkSync(join(OUT, file));
    }
  }

  const report = [];

  for (const [name, config] of Object.entries(VECTOR_ASSETS)) {
    for (const { density, size } of sizesFor(config.base, config.densities)) {
      const image = svgSource(SOURCES, name).resize({ width: size, height: size });

      const webpLossless = await image.clone().webp({ lossless: true, effort: 6 }).toBuffer();
      const webpLossy = await image
        .clone()
        .webp({ lossless: false, quality: 86, alphaQuality: 100, effort: 6 })
        .toBuffer();
      const webp = webpLossless.byteLength <= webpLossy.byteLength ? webpLossless : webpLossy;

      const webpPath = join(OUT, `${name}@${density}x.webp`);
      writeFileSync(webpPath, webp);
      report.push([basename(webpPath), formatBytes(webp.byteLength), '—', '—']);
    }

    // Single PNG-8 fallback at the highest density for flat vectors.
    const maxSize = Math.max(...config.densities) * config.base;
    const png = await svgSource(SOURCES, name)
      .resize({ width: maxSize, height: maxSize })
      .png({ palette: true, compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    const pngPath = join(OUT, `${name}.png`);
    writeFileSync(pngPath, png);
    report.push([basename(pngPath), formatBytes(png.byteLength), 'fallback', 'máx densidad']);

    report.push([
      `source: ${name}.svg`,
      formatBytes(statSync(join(SOURCES, `${name}.svg`)).size),
      '—',
      '—',
    ]);
  }

  for (const [name, config] of Object.entries(RASTER_ASSETS)) {
    for (const { density, size } of sizesFor(config.base, config.densities)) {
      const image = rasterSource(SOURCES, config).resize({ width: size, height: size });

      const webp = await image
        .clone()
        .webp({
          lossless: false,
          quality: config.webpQuality,
          alphaQuality: 100,
          effort: 6,
          smartSubsample: true,
        })
        .toBuffer();

      const webpPath = join(OUT, `${name}@${density}x.webp`);
      writeFileSync(webpPath, webp);
      report.push([
        basename(webpPath),
        formatBytes(webp.byteLength),
        'WebP lossy',
        `q${config.webpQuality}`,
      ]);
    }

    // Low-fidelity PNG-8 fallback (quantized) as a decode safety net.
    const png = await rasterSource(SOURCES, config)
      .resize({ width: config.fallbackSize, height: config.fallbackSize })
      .png({
        palette: true,
        dither: 1.0,
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();
    const pngPath = join(OUT, `${name}.png`);
    writeFileSync(pngPath, png);
    report.push([
      basename(pngPath),
      formatBytes(png.byteLength),
      'fallback',
      `${config.fallbackSize}px`,
    ]);

    report.push([
      `source: ${config.source}`,
      formatBytes(statSync(join(SOURCES, config.source)).size),
      '—',
      '—',
    ]);
  }

  console.log('Generated brand assets');
  console.log('  vector: WebP lossless/lossy min + PNG-8 fallback');
  console.log('  raster hero: single WebP @3x + PNG-8 fallback');
  console.table([...report]);
}

generate().catch((error) => {
  console.error('Failed to generate brand assets:', error);
  process.exitCode = 1;
});
