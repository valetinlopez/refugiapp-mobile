import { apiClient, type HttpClient, type HttpRequestOptions } from '@/core/api';
import { DOCUMENT_MEDIA_TYPES, validateMediaFile, type MediaFile } from '@/core/media';

import type { MediaAsset, PaginatedAnimalFiles, PaginatedMediaAssetsResponse } from '../types';
import { toPaginatedAnimalFiles } from '../types';

export type AnimalFileUpload = MediaFile;
export type AnimalFileUploadOptions = Pick<HttpRequestOptions, 'onUploadProgress' | 'signal'>;

export function buildAnimalFileFormData(file: AnimalFileUpload, animalId: string): FormData {
  const formData = new FormData();
  formData.append(
    'file',
    file.file ??
      ({
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as unknown as Blob)
  );
  formData.append('ownerType', 'animal');
  formData.append('ownerId', animalId);
  return formData;
}

/**
 * Animal archive endpoints (D17 / RFG-150).
 *
 * Files belong to the animal through `ownerType=animal` + `ownerId`, so they
 * are linked on upload and can be listed and removed without any orphan step.
 * Only the contract published in OpenAPI is consumed: `GET /media`,
 * `POST /media/upload` and `DELETE /media/:id`.
 */
export const animalFilesApi = {
  async listByAnimal(
    animalId: string,
    page = 1,
    limit = 20,
    client: HttpClient = apiClient
  ): Promise<PaginatedAnimalFiles> {
    const response = await client.get<PaginatedMediaAssetsResponse>('/media', {
      params: { ownerType: 'animal', ownerId: animalId, page, limit },
    });
    return toPaginatedAnimalFiles(response.data);
  },

  async uploadToAnimal(
    animalId: string,
    file: AnimalFileUpload,
    client: HttpClient = apiClient,
    options: AnimalFileUploadOptions = {}
  ): Promise<MediaAsset> {
    assertValidAnimalFile(file);
    const response = await client.post<MediaAsset>(
      '/media/upload',
      buildAnimalFileFormData(file, animalId),
      { ...options, retry: 0 }
    );
    return response.data;
  },

  async deleteAsset(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete(`/media/${id}`);
  },
};

function assertValidAnimalFile(file: AnimalFileUpload): void {
  const validationError = validateMediaFile(file, DOCUMENT_MEDIA_TYPES);
  if (validationError !== null) {
    throw new Error(`Invalid animal file: ${validationError}`);
  }
}
