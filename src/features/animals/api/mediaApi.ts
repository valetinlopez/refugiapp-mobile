import { apiClient, type HttpClient, type HttpRequestOptions } from '@/core/api';
import {
  IMAGE_MEDIA_TYPES,
  MAX_MEDIA_FILE_BYTES,
  validateMediaFile,
  type MediaFile,
} from '@/core/media';

import type { MediaAsset } from '../types';

export type PhotoFile = MediaFile;

export const MAX_PROFILE_PHOTO_BYTES = MAX_MEDIA_FILE_BYTES;

export function buildOrphanPhotoFormData(photo: PhotoFile): FormData {
  const formData = new FormData();
  formData.append(
    'file',
    photo.file ??
      ({
        uri: photo.uri,
        name: photo.name,
        type: photo.mimeType,
      } as unknown as Blob)
  );
  return formData;
}

export const mediaApi = {
  async getById(id: string, client: HttpClient = apiClient): Promise<MediaAsset> {
    const response = await client.get<MediaAsset>(`/media/${id}`);
    return response.data;
  },

  async uploadOrphanPhoto(
    photo: PhotoFile,
    client: HttpClient = apiClient,
    options: Pick<HttpRequestOptions, 'onUploadProgress' | 'signal'> = {}
  ): Promise<MediaAsset> {
    const validationError = validateMediaFile(photo, IMAGE_MEDIA_TYPES);
    if (validationError !== null) {
      throw new Error(`Invalid profile photo: ${validationError}`);
    }
    const response = await client.post<MediaAsset>(
      '/media/upload',
      buildOrphanPhotoFormData(photo),
      { ...options, retry: 0 }
    );
    return response.data;
  },

  async deleteAsset(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete(`/media/${id}`);
  },
};
