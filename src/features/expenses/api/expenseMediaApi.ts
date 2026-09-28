import { apiClient, type HttpClient } from '@/core/api';
import type { components } from '@/core/api/generated/openapi';

type MediaAsset = components['schemas']['MediaAssetResponseDto'];

export async function getExpenseReceipt(
  mediaId: string,
  client: HttpClient = apiClient
): Promise<MediaAsset> {
  const response = await client.get<MediaAsset>(`/media/${mediaId}`);
  return response.data;
}
