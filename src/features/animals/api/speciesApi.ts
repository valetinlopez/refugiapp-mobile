import { apiClient, type HttpClient } from '@/core/api';

import type { Breed, BreedListResponse, Species, SpeciesListResponse } from '../types';
import { toBreedList, toSpeciesList } from '../types';

export const speciesApi = {
  async getSpecies(client: HttpClient = apiClient): Promise<Species[]> {
    const response = await client.get<SpeciesListResponse>('/species');
    return toSpeciesList(response.data);
  },

  async getBreeds(speciesId: string, client: HttpClient = apiClient): Promise<Breed[]> {
    const response = await client.get<BreedListResponse>(`/species/${speciesId}/breeds`);
    return toBreedList(response.data);
  },
};
