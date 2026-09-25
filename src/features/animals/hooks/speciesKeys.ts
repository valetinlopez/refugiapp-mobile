export const speciesKeys = {
  all: ['species'] as const,
  list: () => [...speciesKeys.all, 'list'] as const,
  breeds: (speciesId: string) => [...speciesKeys.all, 'breeds', speciesId] as const,
};
