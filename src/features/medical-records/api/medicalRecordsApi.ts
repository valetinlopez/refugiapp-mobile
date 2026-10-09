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

  /**
   * Global clinical history. The contract only accepts `recordType`, `from` and
   * `to`; there is no `animalId` server filter, so an animal selection is a
   * client-side concern of the screen.
   */
  async list(
    filters: MedicalRecordFilters = {},
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedMedicalRecords> {
    const response = await client.get<PaginatedMedicalRecordsResponse>('/medical-records', {
      params: {
        page,
        limit,
        recordType: filters.recordType,
        from: filters.from,
        to: filters.to,
      },
    });
    return toPaginatedMedicalRecords(response.data);
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
        params: {
          page,
          limit,
          recordType: filters.recordType,
          from: filters.from,
          to: filters.to,
        },
      }
    );
    return toPaginatedMedicalRecords(response.data);
  },
};
