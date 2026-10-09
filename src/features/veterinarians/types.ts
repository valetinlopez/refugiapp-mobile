import type { components } from '@/core/api/generated/openapi';

export type VeterinarianResponse = components['schemas']['VeterinarianResponseDto'];
export type PaginatedVeterinariansResponse =
  components['schemas']['PaginatedVeterinariansResponseDto'];
export type CreateVeterinarianRequest = components['schemas']['CreateVeterinarianDto'];
export type UpdateVeterinarianRequest = components['schemas']['UpdateVeterinarianDto'];

/**
 * Status filter for the veterinarian listing. `all` maps to an `undefined`
 * `isActive` so the request never sends a value the backend does not receive
 * today; only `active`/`inactive` become a boolean.
 */
export type VeterinarianStatusFilter = 'all' | 'active' | 'inactive';

/**
 * Contractual query filters of `GET /veterinarians`. The backend combines
 * `name`, `licenseNumber` and `isActive` in AND; every field is optional.
 */
export interface VeterinarianListFilters {
  isActive?: boolean;
  licenseNumber?: string;
  name?: string;
}
