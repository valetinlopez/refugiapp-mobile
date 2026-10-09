/**
 * Shares the `['veterinarians']` root with the veterinarians feature so an
 * existing `invalidateQueries({ queryKey: ['veterinarians'] })` after a vet
 * mutation also refreshes this directory by prefix. No cross-feature import is
 * needed to keep them coherent.
 */
export const veterinarianDirectoryKeys = {
  all: ['veterinarians'] as const,
  directory: () => [...veterinarianDirectoryKeys.all, 'directory'] as const,
  detail: (id: string) => [...veterinarianDirectoryKeys.all, 'detail', id] as const,
};
