export const radii = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  organic: 36,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radii;
