import { colors } from './colors';

function luminance(hex: string): number {
  const clean = hex.replace('#', '').slice(0, 6);
  const channels = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)].map(
    (part) => parseInt(part, 16) / 255
  );
  const [r = 0, g = 0, b = 0] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const light = luminance(foreground);
  const dark = luminance(background);
  const high = Math.max(light, dark);
  const low = Math.min(light, dark);
  return (high + 0.05) / (low + 0.05);
}

describe('theme contrast (RFG-88, WCAG AA)', () => {
  it.each([
    ['textPrimary sobre background', colors.textPrimary, colors.background],
    ['textPrimary sobre surfaceElevated', colors.textPrimary, colors.surfaceElevated],
    ['textPrimary sobre surfaceSubtle', colors.textPrimary, colors.surfaceSubtle],
    ['textSecondary sobre surface', colors.textSecondary, colors.surface],
    ['textSecondary sobre surfaceElevated', colors.textSecondary, colors.surfaceElevated],
    ['textSecondary sobre surfaceSubtle', colors.textSecondary, colors.surfaceSubtle],
    ['textSecondary sobre background', colors.textSecondary, colors.background],
    ['textInverse sobre positive', colors.textInverse, colors.positive],
    ['textInverse sobre warning', colors.textInverse, colors.warning],
    ['textInverse sobre danger', colors.textInverse, colors.danger],
    ['textInverse sobre info', colors.textInverse, colors.info],
    ['textInverse sobre neutral', colors.textInverse, colors.neutral],
    ['disabledText sobre disabledSurface', colors.disabledText, colors.disabledSurface],
  ])('%s alcanza 4.5:1', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
