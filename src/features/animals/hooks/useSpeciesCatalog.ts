import {
  findSpeciesBySlug,
  toBreedOptions,
  toSpeciesOptions,
  type CatalogStatus,
} from '../utils/speciesCatalog';

import { useBreeds } from './useBreeds';
import { useSpecies } from './useSpecies';

export function useSpeciesCatalog(speciesValue: string | undefined) {
  const speciesQuery = useSpecies();
  const speciesList = speciesQuery.data ?? [];
  const speciesOptions = toSpeciesOptions(speciesList);
  const speciesStatus: CatalogStatus = speciesQuery.isPending
    ? 'loading'
    : speciesQuery.isError
      ? 'error'
      : speciesList.length === 0
        ? 'empty'
        : 'ready';

  const selectedSpecies = findSpeciesBySlug(speciesList, speciesValue);

  const breedsQuery = useBreeds(selectedSpecies?.id);
  const breedList = breedsQuery.data ?? [];
  const breedOptions = toBreedOptions(breedList);
  const breedStatus: CatalogStatus =
    selectedSpecies === undefined
      ? 'empty'
      : breedsQuery.isPending
        ? 'loading'
        : breedsQuery.isError
          ? 'error'
          : breedList.length === 0
            ? 'empty'
            : 'ready';

  return {
    breedList,
    breedOptions,
    breedStatus,
    retryBreeds: () => void breedsQuery.refetch(),
    retrySpecies: () => void speciesQuery.refetch(),
    selectedSpecies,
    speciesList,
    speciesOptions,
    speciesStatus,
  };
}
