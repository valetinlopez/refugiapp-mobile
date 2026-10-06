/**
 * Jest stub for Metro-resolved PNG assets imported by base name. Kept separate
 * from the WebP stub so tests can assert that primary and fallback are
 * different sources.
 */
module.exports = {
  __esModule: true,
  default: {
    testUri: 'brand-asset-png-mock',
    width: 1,
    height: 1,
    scale: 3,
  },
};
