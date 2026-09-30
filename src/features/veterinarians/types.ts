import type { components } from '@/core/api/generated/openapi';

export type VeterinarianResponse = components['schemas']['VeterinarianResponseDto'];
export type PaginatedVeterinariansResponse =
  components['schemas']['PaginatedVeterinariansResponseDto'];
export type CreateVeterinarianRequest = components['schemas']['CreateVeterinarianDto'];
export type UpdateVeterinarianRequest = components['schemas']['UpdateVeterinarianDto'];
