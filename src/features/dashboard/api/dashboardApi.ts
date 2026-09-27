import { apiClient, type HttpClient } from '@/core/api';

import type { DashboardOverview, DashboardOverviewResponse, MediaAssetResponse } from '../types';
import { toDashboardOverview } from '../types';

export const dashboardApi = {
  async getOverview(client: HttpClient = apiClient): Promise<DashboardOverview> {
    const response = await client.get<DashboardOverviewResponse>('/dashboard/overview');
    return toDashboardOverview(response.data);
  },

  async getAnimalPhoto(
    mediaId: string,
    client: HttpClient = apiClient
  ): Promise<MediaAssetResponse> {
    const response = await client.get<MediaAssetResponse>(`/media/${mediaId}`);
    return response.data;
  },
};
