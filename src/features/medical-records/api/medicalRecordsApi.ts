import { apiClient, type HttpClient } from '@/core/api';

import type {
  CreateMedicalRecordRequest,
  MedicalRecord,
  MedicalRecordFilters,
  MedicalRecordResponse,
  PaginatedMedicalRecords,
  PaginatedMedicalRecordsResponse,
  UpdateMedicalRecordRequest,
} from '../types';
import { toMedicalRecord, toPaginatedMedicalRecords } from '../types';

export const medicalRecordsApi = {
  async create(
    data: CreateMedicalRecordRequest,
    client: HttpClient = apiClient
  ): Promise<MedicalRecord> {
    const response = await client.post<MedicalRecordResponse>('/medical-records', data);
    return toMedicalRecord(response.data);
  },

  async getById(id: string, client: HttpClient = apiClient): Promise<MedicalRecord> {
    const response = await client.get<MedicalRecordResponse>(`/medical-records/${id}`);
    return toMedicalRecord(response.data);
  },

  async update(
    id: string,
    data: UpdateMedicalRecordRequest,
    client: HttpClient = apiClient
  ): Promise<MedicalRecord> {
    const response = await client.patch<MedicalRecordResponse>(`/medical-records/${id}`, data);
    return toMedicalRecord(response.data);
  },

  async listByAnimal(
    animalId: string,
    filters: MedicalRecordFilters = {},
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedMedicalRecords> {
    const response = await client.get<PaginatedMedicalRecordsResponse>(
      `/animals/${animalId}/medical-records`,
      {
        params: { page, limit, recordType: filters.recordType },
      }
    );
    return toPaginatedMedicalRecords(response.data);
  },
};
