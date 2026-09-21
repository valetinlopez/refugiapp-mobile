export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  detail: (id: string) => [...animalKeys.all, 'detail', id] as const,
  media: (mediaId: string) => [...animalKeys.all, 'media', mediaId] as const,
};
