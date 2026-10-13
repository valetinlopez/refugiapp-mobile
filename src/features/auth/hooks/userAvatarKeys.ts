export const userAvatarKeys = {
  all: ['users', 'avatar'] as const,
  asset: (mediaId: string) => [...userAvatarKeys.all, mediaId] as const,
};
