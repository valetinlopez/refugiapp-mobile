import type { Breed, Species } from '../types';

export const OTHER_OPTION_VALUE = '__other__';

export type CatalogStatus = 'loading' | 'error' | 'empty' | 'ready';

export interface CatalogOption {
  label: string;
  value: string;
}

export function toSpeciesOptions(species: Species[]): CatalogOption[] {
  return species.map((item) => ({ label: item.labelEs, value: item.slug }));
}

export function toBreedOptions(breeds: Breed[]): CatalogOption[] {
  return breeds.map((item) => ({ label: item.labelEs, value: item.slug }));
}

export function findSpeciesBySlug(
  species: Species[],
  slug: string | undefined
): Species | undefined {
  if (slug === undefined) {
    return undefined;
  }
  const normalized = slug.trim();
  return species.find((item) => item.slug === normalized);
}

export function isKnownCatalogValue(value: string | undefined, options: CatalogOption[]): boolean {
  return value !== undefined && value !== '' && options.some((option) => option.value === value);
}
