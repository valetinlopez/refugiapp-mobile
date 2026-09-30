export const veterinarianKeys = {
  all: ['veterinarians'] as const,
  lists: () => [...veterinarianKeys.all, 'list'] as const,
  detail: (id: string) => [...veterinarianKeys.all, 'detail', id] as const,
};
