export const motion = {
  durationSubtle: 150,
} as const;

export type MotionToken = keyof typeof motion;
