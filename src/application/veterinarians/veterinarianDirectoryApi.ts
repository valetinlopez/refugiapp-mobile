import { apiClient, type HttpClient } from '@/core/api';
import type { components } from '@/core/api/generated/openapi';

type PaginatedVeterinariansResponse = components['schemas']['PaginatedVeterinariansResponseDto'];
type VeterinarianResponse = components['schemas']['VeterinarianResponseDto'];

export interface VeterinarianDirectoryEntry {
  id: string;
  licenseNumber: string;
  name: string;
}

function toDirectoryEntry(dto: VeterinarianResponse): VeterinarianDirectoryEntry {
  return {
    id: dto.id,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    licenseNumber: dto.licenseNumber,
  };
}

/**
 * Read-only directory of veterinarians used to resolve names in list screens
 * without a request per row. It reads the first page of active veterinarians
 * (the contract publishes no unbounded listing) and sorts alphabetically on the
 * client so every consumer shows the same deterministic order.
 */
export const veterinarianDirectoryApi = {
  async listActive(client: HttpClient = apiClient): Promise<VeterinarianDirectoryEntry[]> {
    const response = await client.get<PaginatedVeterinariansResponse>('/veterinarians', {
      params: { page: 1, limit: 100, isActive: true },
    });
    return response.data.items
      .map(toDirectoryEntry)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<VeterinarianDirectoryEntry> {
    const response = await client.get<VeterinarianResponse>(`/veterinarians/${id}`);
    return toDirectoryEntry(response.data);
  },
};
