import { apiClient, type HttpClient } from '@/core/api';

import type { PaginatedVeterinariansResponse, VeterinarianOption } from '../types';
import { toVeterinarianOption } from '../types';

export const veterinarianOptionsApi = {
  async listActive(client: HttpClient = apiClient): Promise<VeterinarianOption[]> {
    const response = await client.get<PaginatedVeterinariansResponse>('/veterinarians', {
      params: { page: 1, limit: 100, isActive: true },
    });
    return response.data.items.map(toVeterinarianOption);
  },
};
