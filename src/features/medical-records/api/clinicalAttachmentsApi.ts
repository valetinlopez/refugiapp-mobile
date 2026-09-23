import { apiClient, type HttpClient } from '@/core/api';

import type { ClinicalAttachment, MediaAsset, PaginatedMediaAssetsResponse } from '../types';
import { toClinicalAttachment } from '../types';

export interface AttachmentFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export const MAX_CLINICAL_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export function buildAttachmentFormData(file: AttachmentFile): FormData {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);
  return formData;
}

export const clinicalAttachmentsApi = {
  async uploadOrphan(file: AttachmentFile, client: HttpClient = apiClient): Promise<MediaAsset> {
    const response = await client.post<MediaAsset>('/media/upload', buildAttachmentFormData(file), {
      retry: 0,
    });
    return response.data;
  },

  async uploadToRecord(
    recordId: string,
    file: AttachmentFile,
    client: HttpClient = apiClient
  ): Promise<MediaAsset> {
    const formData = buildAttachmentFormData(file);
    formData.append('ownerType', 'medical_record');
    formData.append('ownerId', recordId);
    const response = await client.post<MediaAsset>('/media/upload', formData, { retry: 0 });
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
