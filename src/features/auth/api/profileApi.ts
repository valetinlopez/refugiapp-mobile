import { apiClient, type HttpClient, type HttpRequestOptions } from '@/core/api';
import { IMAGE_MEDIA_TYPES, validateMediaFile, type MediaFile } from '@/core/media';

import type { User } from '../types';

export type ProfilePhotoFile = MediaFile;
export type MediaAsset = {
  id: string;
  secureUrl: string;
};

export function buildAvatarFormData(photo: ProfilePhotoFile): FormData {
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

export const profileApi = {
  async getAvatarAsset(id: string, client: HttpClient = apiClient): Promise<MediaAsset> {
    const response = await client.get<MediaAsset>(`/media/${id}`);
    return response.data;
  },

  async uploadOrphanAvatar(
    photo: ProfilePhotoFile,
    client: HttpClient = apiClient,
    options: Pick<HttpRequestOptions, 'onUploadProgress' | 'signal'> = {}
  ): Promise<MediaAsset> {
    const validationError = validateMediaFile(photo, IMAGE_MEDIA_TYPES);
    if (validationError !== null) {
      throw new Error(`Invalid profile photo: ${validationError}`);
    }
    const response = await client.post<MediaAsset>('/media/upload', buildAvatarFormData(photo), {
      ...options,
      retry: 0,
    });
    return response.data;
  },

  async updatePhoto(
    userId: string,
    profilePhotoMediaId: string | null,
    client: HttpClient = apiClient
  ): Promise<User> {
    const response = await client.patch<User>(`/users/${userId}`, {
      profilePhotoMediaId,
    });
    return response.data;
  },

  async deleteAsset(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete(`/media/${id}`);
  },
};
