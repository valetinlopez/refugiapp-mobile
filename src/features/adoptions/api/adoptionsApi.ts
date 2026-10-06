import { apiClient, type HttpClient } from '@/core/api';

import type {
  Adoption,
  AdoptionApplication,
  Adopter,
  ApproveAdoptionRequest,
  CreateAdopterRequest,
  CreateAdoptionApplicationRequest,
  PaginatedAdoptionApplications,
  PaginatedAdoptions,
} from '../types';

export const adoptionsApi = {
  async createAdopter(
    data: CreateAdopterRequest,
    client: HttpClient = apiClient
  ): Promise<Adopter> {
    const response = await client.post<Adopter>('/adopters', data);
    return response.data;
  },

  async getAdopter(id: string, client: HttpClient = apiClient): Promise<Adopter> {
    const response = await client.get<Adopter>(`/adopters/${id}`);
    return response.data;
  },

  async createApplication(
    animalId: string,
    data: CreateAdoptionApplicationRequest,
    client: HttpClient = apiClient
  ): Promise<AdoptionApplication> {
    const response = await client.post<AdoptionApplication>(
      `/animals/${animalId}/adoption-applications`,
      data
    );
    return response.data;
  },

  async listApplications(
    animalId: string,
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedAdoptionApplications> {
    const response = await client.get<PaginatedAdoptionApplications>(
      `/animals/${animalId}/adoption-applications`,
      { params: { page, limit } }
    );
    return response.data;
  },

  async approveApplication(
    applicationId: string,
    data: ApproveAdoptionRequest = {},
    client: HttpClient = apiClient
  ): Promise<Adoption> {
    const response = await client.post<Adoption>(
      `/adoption-applications/${applicationId}/approve`,
      data
    );
    return response.data;
  },

  async listHistory(
    animalId: string,
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedAdoptions> {
    const response = await client.get<PaginatedAdoptions>(`/animals/${animalId}/adoptions`, {
      params: { page, limit },
    });
    return response.data;
  },
};
