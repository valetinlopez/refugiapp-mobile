/* Ambient types for the raster brand assets bundled by Metro.
 * The static import returns the resolved asset id (number) for the platform
 * density chosen by React Native's asset pipeline at runtime.
 */
declare module '*.webp' {
  const asset: number;
  export default asset;
}

declare module '*.png' {
  const asset: number;
  export default asset;
}
