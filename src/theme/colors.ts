export const colors = {
  background: '#35231D',
  surface: '#50382E',
  surfaceElevated: '#63483B',
  surfaceSubtle: '#432E27',
  textPrimary: '#FAF4E9',
  textSecondary: '#CCBEB1',
  textInverse: '#261914',
  positive: '#B9DB62',
  warning: '#E5A14B',
  danger: '#D96C5F',
  info: '#75A7B8',
  neutral: '#AAA29D',
  border: '#76594D',
  divider: '#80675D',
  focus: '#F1D99D',
  pressedOverlay: '#FFFFFF14',
  disabledSurface: '#5A4A43',
  disabledText: '#A89A91',
  scrim: '#1B100CCC',
  transparent: '#00000000',
} as const;

export type ColorToken = keyof typeof colors;
