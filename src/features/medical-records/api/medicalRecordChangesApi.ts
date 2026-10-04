import { apiClient, type HttpClient } from '@/core/api';

import type {
  MedicalRecordChangeFilters,
  PaginatedMedicalRecordChanges,
  PaginatedMedicalRecordChangesResponse,
} from '../types';
import { toPaginatedMedicalRecordChanges } from '../types';

export const medicalRecordChangesApi = {
  async listChanges(
    recordId: string,
    page = 1,
    limit = 20,
    filters: MedicalRecordChangeFilters = {},
    client: HttpClient = apiClient
  ): Promise<PaginatedMedicalRecordChanges> {
    const response = await client.get<PaginatedMedicalRecordChangesResponse>(
      `/medical-records/${recordId}/changes`,
      { params: { page, limit, ...filters } }
    );
    return toPaginatedMedicalRecordChanges(response.data);
  },
};
