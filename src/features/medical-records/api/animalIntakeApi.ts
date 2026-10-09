import { apiClient, type HttpClient } from '@/core/api';
import type { components } from '@/core/api/generated/openapi';
import { toDateOnly } from '@/core/validation';

type AnimalResponse = components['schemas']['AnimalResponseDto'];

/**
 * Resolves only the animal's `intakeDate` for the clinical `occurredAt` window.
 *
 * The global create form lists animals through the minimal `AnimalOption`
 * contract (no intake date), so when the user picks one we read `GET /animals/:id`
 * once and normalize the ISO datetime to `YYYY-MM-DD`. Keeping this inside the
 * feature avoids expanding the shared `application/animals` boundary and honors
 * "one request when the selection changes", never one per rendered row.
 */
export const animalIntakeApi = {
  async getIntakeDate(id: string, client: HttpClient = apiClient): Promise<string | null> {
    const response = await client.get<AnimalResponse>(`/animals/${id}`);
    return toDateOnly(response.data.intakeDate);
  },
};
