import type { TextStyle } from 'react-native';

export const fontFamilies = {
  heading: 'Newsreader_600SemiBold',
  body: 'DMSans_400Regular',
  bodyStrong: 'DMSans_600SemiBold',
  button: 'DMSans_700Bold',
} as const;

export const typography = {
  display: {
    fontFamily: fontFamilies.heading,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -0.6,
  },
  heading1: {
    fontFamily: fontFamilies.heading,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.35,
  },
  heading2: {
    fontFamily: fontFamilies.heading,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.2,
  },
  heading3: {
    fontFamily: fontFamilies.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: fontFamilies.bodyStrong,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: fontFamilies.bodyStrong,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 17,
  },
  button: {
    fontFamily: fontFamilies.button,
    fontSize: 15,
    lineHeight: 20,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
