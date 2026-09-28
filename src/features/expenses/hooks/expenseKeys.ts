export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  listByAnimal: (animalId: string) => [...expenseKeys.lists(), 'animal', animalId] as const,
  media: (mediaId: string) => [...expenseKeys.all, 'media', mediaId] as const,
  animals: [...['expenses'], 'animal-options'] as const,
};

export const dashboardQueryKey = ['dashboard'] as const;
