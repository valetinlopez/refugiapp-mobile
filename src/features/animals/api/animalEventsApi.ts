import { apiClient, type HttpClient } from '@/core/api';

import type {
  AnimalHistoryEventResponse,
  CreateAnimalHistoryEventRequest,
  PaginatedAnimalHistoryEvents,
  PaginatedAnimalHistoryEventsResponse,
} from '../types';
import { toPaginatedAnimalHistoryEvents } from '../types';

export interface AnimalHistoryFilters {
  eventType?: AnimalHistoryEventResponse['eventType'];
}

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

  async list(
    animalId: string,
    filters: AnimalHistoryFilters = {},
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedAnimalHistoryEvents> {
    const response = await client.get<PaginatedAnimalHistoryEventsResponse>(
      `/animals/${animalId}/events`,
      {
        params: { page, limit, eventType: filters.eventType },
      }
    );
    return toPaginatedAnimalHistoryEvents(response.data);
  },
};
