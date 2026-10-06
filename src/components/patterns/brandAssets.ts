import brandLeafMarkPng from '../../../assets/images/brand/brand-leaf-mark.png';
import brandLeafMarkWebp from '../../../assets/images/brand/brand-leaf-mark.webp';
import heroRescuedDogPng from '../../../assets/images/brand/hero-rescued-dog.png';
import heroRescuedDogWebp from '../../../assets/images/brand/hero-rescued-dog.webp';
import leafTextureTilePng from '../../../assets/images/brand/leaf-texture-tile.png';
import leafTextureTileWebp from '../../../assets/images/brand/leaf-texture-tile.webp';

/**
 * Registered brand assets (D02 / RFG-135).
 *
 * Each entry exposes a WebP source set plus a PNG fallback. The base require
 * represents the whole `@1x/@2x/@3x` variant set; Metro bundles all densities
 * and React Native selects the one matching the device pixel ratio at runtime.
 * The PNG fallback is used only when the primary format cannot be decoded (see
 * `DecorativeImage`).
 *
 * All assets are original, vector-based illustrations (sources in
 * `docs/brand-assets/sources`) and are strictly decorative: no text, no state,
 * no functional information is encoded in the bitmaps.
 */
export type BrandAssetName = 'heroRescuedDog' | 'brandLeafMark' | 'leafTextureTile';

export interface BrandSource {
  /** WebP source (full density set resolved by the RN asset pipeline). */
  webp: number;
  /** PNG fallback at maximum density. */
  png: number;
}

export const brandAssets = {
  heroRescuedDog: { webp: heroRescuedDogWebp, png: heroRescuedDogPng },
  brandLeafMark: { webp: brandLeafMarkWebp, png: brandLeafMarkPng },
  leafTextureTile: { webp: leafTextureTileWebp, png: leafTextureTilePng },
} as const satisfies Record<BrandAssetName, BrandSource>;

/**
 * Returns the source set for a given brand asset. Density selection is
 * delegated to the RN asset pipeline (`expo-image` / Metro), which picks the
 * closest available scale for the device pixel ratio at runtime.
 */
export function resolveBrandSource(name: BrandAssetName): BrandSource {
  return brandAssets[name];
}
