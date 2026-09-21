import { apiClient, type HttpClient } from '@/core/api';

import type { MediaAsset } from '../types';

export interface PhotoFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export const MAX_PROFILE_PHOTO_BYTES = 10 * 1024 * 1024;

export function buildOrphanPhotoFormData(photo: PhotoFile): FormData {
  const formData = new FormData();
  formData.append('file', {
    uri: photo.uri,
    name: photo.name,
    type: photo.mimeType,
  } as unknown as Blob);
  return formData;
}

export const mediaApi = {
  async uploadOrphanPhoto(photo: PhotoFile, client: HttpClient = apiClient): Promise<MediaAsset> {
    const response = await client.post<MediaAsset>(
      '/media/upload',
      buildOrphanPhotoFormData(photo),
      { retry: 0 }
    );
    return response.data;
  },

  async deleteAsset(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete(`/media/${id}`);
  },
};
