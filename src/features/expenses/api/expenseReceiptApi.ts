import { apiClient, type HttpClient, type HttpRequestOptions } from '@/core/api';
import { DOCUMENT_MEDIA_TYPES, validateMediaFile } from '@/core/media';

import type { ReceiptFile } from '../types';

type UploadOptions = Pick<HttpRequestOptions, 'onUploadProgress' | 'signal'>;

export function buildReceiptFormData(file: ReceiptFile): FormData {
  const formData = new FormData();
  formData.append(
    'file',
    file.file ?? ({ uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob)
  );
  return formData;
}

export const expenseReceiptApi = {
  async upload(
    file: ReceiptFile,
    client: HttpClient = apiClient,
    options: UploadOptions = {}
  ): Promise<{ id: string }> {
    const validationError = validateMediaFile(file, DOCUMENT_MEDIA_TYPES);
    if (validationError) throw new Error(`Invalid expense receipt: ${validationError}`);
    const response = await client.post<{ id: string }>(
      '/media/upload',
      buildReceiptFormData(file),
      {
        ...options,
        retry: 0,
      }
    );
    return response.data;
  },

  async delete(id: string, client: HttpClient = apiClient): Promise<void> {
    await client.delete(`/media/${id}`);
  },
};
