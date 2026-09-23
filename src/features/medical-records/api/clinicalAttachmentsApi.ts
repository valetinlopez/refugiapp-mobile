import { apiClient, type HttpClient, type HttpRequestOptions } from '@/core/api';
import {
  DOCUMENT_MEDIA_TYPES,
  MAX_MEDIA_FILE_BYTES,
  validateMediaFile,
  type MediaFile,
} from '@/core/media';

import type { ClinicalAttachment, MediaAsset, PaginatedMediaAssetsResponse } from '../types';
import { toClinicalAttachment } from '../types';

export type AttachmentFile = MediaFile;

export const MAX_CLINICAL_ATTACHMENT_BYTES = MAX_MEDIA_FILE_BYTES;

export type AttachmentUploadOptions = Pick<HttpRequestOptions, 'onUploadProgress' | 'signal'>;

export function buildAttachmentFormData(file: AttachmentFile): FormData {
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
  return formData;
}

export const clinicalAttachmentsApi = {
  async uploadOrphan(
    file: AttachmentFile,
    client: HttpClient = apiClient,
    options: AttachmentUploadOptions = {}
  ): Promise<MediaAsset> {
    assertValidAttachment(file);
    const response = await client.post<MediaAsset>('/media/upload', buildAttachmentFormData(file), {
      ...options,
      retry: 0,
    });
    return response.data;
  },

  async uploadToRecord(
    recordId: string,
    file: AttachmentFile,
    client: HttpClient = apiClient,
    options: AttachmentUploadOptions = {}
  ): Promise<MediaAsset> {
    assertValidAttachment(file);
    const formData = buildAttachmentFormData(file);
    formData.append('ownerType', 'medical_record');
    formData.append('ownerId', recordId);
    const response = await client.post<MediaAsset>('/media/upload', formData, {
      ...options,
      retry: 0,
    });
    return response.data;
  },

  async listByRecord(
    recordId: string,
    client: HttpClient = apiClient
  ): Promise<ClinicalAttachment[]> {
    const response = await client.get<PaginatedMediaAssetsResponse>('/media', {
      params: { ownerType: 'medical_record', ownerId: recordId, page: 1, limit: 100 },
    });
    return response.data.items.map(toClinicalAttachment);
  },

  async delete(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete(`/media/${id}`);
  },
};

function assertValidAttachment(file: AttachmentFile): void {
  const validationError = validateMediaFile(file, DOCUMENT_MEDIA_TYPES);
  if (validationError !== null) {
    throw new Error(`Invalid clinical attachment: ${validationError}`);
  }
}
