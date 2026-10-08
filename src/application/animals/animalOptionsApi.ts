import { apiClient, type HttpClient } from '@/core/api';
import type { components } from '@/core/api/generated/openapi';

type AnimalResponse = components['schemas']['AnimalResponseDto'];
type PaginatedAnimalsResponse = components['schemas']['PaginatedAnimalsResponseDto'];
type MediaAssetResponse = components['schemas']['MediaAssetResponseDto'];

export interface AnimalOption {
  breed?: string | null;
  id: string;
  name: string;
  profilePhotoMediaId?: string | null;
  species?: string;
}

function toAnimalOption(animal: AnimalResponse): AnimalOption {
  return {
    id: animal.id,
    name: animal.name,
    species: animal.species,
    breed: typeof animal.breed === 'string' ? animal.breed : null,
    profilePhotoMediaId:
      typeof animal.profilePhotoMediaId === 'string' ? animal.profilePhotoMediaId : null,
  };
}

export const animalOptionsApi = {
  async list(client: HttpClient = apiClient): Promise<AnimalOption[]> {
    const response = await client.get<PaginatedAnimalsResponse>('/animals', {
      params: { page: 1, limit: 100 },
    });
    return response.data.items
      .map(toAnimalOption)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<AnimalOption> {
    const response = await client.get<AnimalResponse>(`/animals/${id}`);
    return toAnimalOption(response.data);
  },

  async getPhotoUrl(mediaId: string, client: HttpClient = apiClient): Promise<string> {
    const response = await client.get<MediaAssetResponse>(`/media/${mediaId}`);
    return response.data.secureUrl;
  },
};
