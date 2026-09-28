import { apiClient, type HttpClient } from '@/core/api';
import type { components } from '@/core/api/generated/openapi';

type AnimalResponse = components['schemas']['AnimalResponseDto'];
type PaginatedAnimalsResponse = components['schemas']['PaginatedAnimalsResponseDto'];

export interface AnimalOption {
  id: string;
  name: string;
}

export const animalOptionsApi = {
  async list(client: HttpClient = apiClient): Promise<AnimalOption[]> {
    const response = await client.get<PaginatedAnimalsResponse>('/animals', {
      params: { page: 1, limit: 100 },
    });
    return response.data.items
      .map((animal) => ({ id: animal.id, name: animal.name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<AnimalOption> {
    const response = await client.get<AnimalResponse>(`/animals/${id}`);
    return { id: response.data.id, name: response.data.name };
  },
};
