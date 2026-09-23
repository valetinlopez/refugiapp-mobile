import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { clinicalAttachmentsApi } from '../api/clinicalAttachmentsApi';
import { medicalRecordsApi } from '../api/medicalRecordsApi';
import type { MedicalRecord } from '../types';
import type { MedicalRecordRecordFields } from '../utils/medicalRecordSchema';

import { medicalRecordKeys } from './medicalRecordKeys';
import { useCreateMedicalRecord } from './useCreateMedicalRecord';
import { useUpdateMedicalRecord } from './useUpdateMedicalRecord';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const RECORD_ID = '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14';

function record(): MedicalRecord {
  return {
    id: RECORD_ID,
    animalId: ANIMAL_ID,
    veterinarianId: null,
    recordType: 'consultation',
    title: 'Consulta general',
    diagnosis: 'Otitis leve',
    treatment: null,
    notes: null,
    occurredAt: '2026-09-22T14:30:00-03:00',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

function initialFields(): MedicalRecordRecordFields {
  return {
    recordType: 'consultation',
    title: 'Consulta general',
    occurredAt: '2026-09-22T14:30:00-03:00',
    veterinarianId: null,
    diagnosis: 'Otitis leve',
    treatment: null,
    notes: null,
  };
}

describe('medical record mutations', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false, gcTime: 0 }, queries: { retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('invalidates the clinical history list after creating', async () => {
    jest.spyOn(medicalRecordsApi, 'create').mockResolvedValue(record());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateMedicalRecord(), { wrapper });

    result.current.mutate({
      form: {
        animalId: ANIMAL_ID,
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: undefined,
        diagnosis: 'Otitis leve',
        treatment: undefined,
        notes: undefined,
      },
      attachments: [],
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: medicalRecordKeys.lists() });
  });

  it('uploads orphan attachments and cleans them up when creation fails', async () => {
    const upload = jest.spyOn(clinicalAttachmentsApi, 'uploadOrphan').mockResolvedValue({
      id: 'media-1',
      resourceType: 'image',
      publicId: 'refugiapp/rx',
      secureUrl: 'https://cdn.test/rx.jpg',
    });
    const remove = jest.spyOn(clinicalAttachmentsApi, 'delete').mockResolvedValue(undefined);
    jest.spyOn(medicalRecordsApi, 'create').mockRejectedValue(new Error('create failed'));
    const { result } = await renderHook(() => useCreateMedicalRecord(), { wrapper });

    result.current.mutate({
      form: {
        animalId: ANIMAL_ID,
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
      },
      attachments: [{ uri: 'file:///rx.jpg', name: 'rx.jpg', mimeType: 'image/jpeg' }],
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(upload).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('media-1');
  });

  it('invalidates the clinical history list and updates detail after editing', async () => {
    jest.spyOn(medicalRecordsApi, 'update').mockResolvedValue(record());
    jest.spyOn(medicalRecordsApi, 'getById').mockResolvedValue(record());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const setData = jest.spyOn(queryClient, 'setQueryData');
    const { result } = await renderHook(() => useUpdateMedicalRecord(), { wrapper });

    result.current.mutate({
      id: RECORD_ID,
      initial: initialFields(),
      form: {
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: undefined,
        diagnosis: undefined,
        treatment: undefined,
        notes: undefined,
      },
      newAttachments: [],
      removedAttachmentIds: [],
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setData).toHaveBeenCalledWith(medicalRecordKeys.detail(RECORD_ID), record());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: medicalRecordKeys.lists() });
  });

  it('uploads new attachments directly to the record on edit', async () => {
    jest.spyOn(medicalRecordsApi, 'update').mockResolvedValue(record());
    const upload = jest.spyOn(clinicalAttachmentsApi, 'uploadToRecord').mockResolvedValue({
      id: 'media-2',
      resourceType: 'image',
      publicId: 'refugiapp/rx2',
      secureUrl: 'https://cdn.test/rx2.jpg',
    });
    const { result } = await renderHook(() => useUpdateMedicalRecord(), { wrapper });

    result.current.mutate({
      id: RECORD_ID,
      initial: initialFields(),
      form: {
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
      },
      newAttachments: [{ uri: 'file:///rx2.jpg', name: 'rx2.jpg', mimeType: 'image/jpeg' }],
      removedAttachmentIds: [],
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(upload).toHaveBeenCalledWith(RECORD_ID, {
      uri: 'file:///rx2.jpg',
      name: 'rx2.jpg',
      mimeType: 'image/jpeg',
    });
  });
});
