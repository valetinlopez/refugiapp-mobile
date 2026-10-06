/**
 * Jest stub for Metro-resolved WebP assets imported by base name. Metro
 * resolves the full @1x/@2x/@3x variant set at bundle time; in tests the
 * importing module only needs an identity per required asset.
 */
module.exports = {
  __esModule: true,
  default: {
    testUri: 'brand-asset-webp-mock',
    width: 1,
    height: 1,
    scale: 3,
  },
};
