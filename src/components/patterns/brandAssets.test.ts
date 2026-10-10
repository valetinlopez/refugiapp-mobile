import { brandAssets, resolveBrandSource } from './brandAssets';

describe('brandAssets (RFG-135)', () => {
  it('registers every brand asset with a WebP source and a PNG fallback', () => {
    const names = ['heroRescuedDog', 'heroHome', 'brandLeafMark', 'leafTextureTile'] as const;

    expect(Object.keys(brandAssets)).toEqual([...names]);

    for (const name of names) {
      const source = resolveBrandSource(name);
      expect(source.webp).toBeDefined();
      expect(source.png).toBeDefined();
      expect(source.webp).not.toBe(source.png);
    }
  });

  it('keeps a stable source set per asset so the UI layer stays decoupled from file names', () => {
    expect(resolveBrandSource('heroRescuedDog')).toBe(brandAssets.heroRescuedDog);
    expect(resolveBrandSource('heroHome')).toBe(brandAssets.heroHome);
    expect(resolveBrandSource('brandLeafMark')).toBe(brandAssets.brandLeafMark);
    expect(resolveBrandSource('leafTextureTile')).toBe(brandAssets.leafTextureTile);
  });

  it('keeps the primary WebP source distinct from the PNG fallback', () => {
    expect(resolveBrandSource('heroRescuedDog').webp).not.toBe(
      resolveBrandSource('heroRescuedDog').png
    );
  });
});
