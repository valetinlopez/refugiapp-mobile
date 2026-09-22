import { apiClient, type HttpClient } from '@/core/api';

import type { AnimalHistoryEventResponse, CreateAnimalHistoryEventRequest } from '../types';

export const animalEventsApi = {
  async create(
    animalId: string,
    data: CreateAnimalHistoryEventRequest,
    client: HttpClient = apiClient
  ): Promise<AnimalHistoryEventResponse> {
    const response = await client.post<AnimalHistoryEventResponse>(
      `/animals/${animalId}/events`,
      data
    );
    return response.data;
  },
};
