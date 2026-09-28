export const animalOptionsKeys = {
  all: ['animal-options'] as const,
  list: () => [...animalOptionsKeys.all, 'list'] as const,
  detail: (id: string) => [...animalOptionsKeys.all, 'detail', id] as const,
};
