export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  media: (mediaId: string) => [...dashboardKeys.all, 'media', mediaId] as const,
};
