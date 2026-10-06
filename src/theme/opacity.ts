/**
 * Interaction and layering opacity tokens.
 *
 * Keeping these values out of components avoids magic numbers and lets every
 * pressed state and decorative overlay stay consistent across platforms.
 */
export const opacity = {
  /** Standard pressed feedback for buttons and pressable surfaces. */
  pressed: 0.84,
  /** Softer pressed feedback for dense navigation rows. */
  pressedSubtle: 0.72,
  /** Darkening layer that keeps foreground copy readable over decorative art. */
  overlay: 0.5,
} as const;

export type OpacityToken = keyof typeof opacity;
