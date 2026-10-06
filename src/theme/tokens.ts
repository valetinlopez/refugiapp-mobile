import { colors } from './colors';
import { opacity } from './opacity';
import { radii } from './radii';
import { shadows } from './shadows';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { fontFamilies, typography } from './typography';

export const tokens = {
  colors,
  fontFamilies,
  opacity,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} as const;

export type Theme = typeof tokens;
