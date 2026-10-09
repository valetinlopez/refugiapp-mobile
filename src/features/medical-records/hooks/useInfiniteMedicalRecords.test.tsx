import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { medicalRecordsApi } from '../api/medicalRecordsApi';
import type { MedicalRecord, PaginatedMedicalRecords } from '../types';
import { flattenMedicalRecordPages, useInfiniteMedicalRecords } from './useInfiniteMedicalRecords';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createRecord(id: string): MedicalRecord {
  return {
    id,
    animalId: ANIMAL_ID,
    veterinarianId: null,
    recordType: 'consultation',
    title: 'Consulta',
    diagnosis: null,
    treatment: null,
    notes: null,
    occurredAt: '2026-09-22T12:00:00.000Z',
    createdAt: '2026-09-22T12:00:00.000Z',
    updatedAt: '2026-09-22T12:00:00.000Z',
  };
}

function createPage(page = 1, total = 1): PaginatedMedicalRecords {
  return { items: [createRecord(`${String(page)}-record`)], page, limit: 20, total };
}

describe('useInfiniteMedicalRecords', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: 0, retry: false } } });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('pages the global list with the server filters at 20 per page', async () => {
    const list = jest
      .spyOn(medicalRecordsApi, 'list')
      .mockResolvedValueOnce(createPage(1, 21))
      .mockResolvedValueOnce(createPage(2, 21));
    const filters = { recordType: 'vaccination' as const, from: '2026-09-01T00:00:00.000Z' };
    const { result } = await renderHook(() => useInfiniteMedicalRecords(filters), { wrapper });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(list).toHaveBeenNthCalledWith(1, filters, 1, 20);
    expect(list).toHaveBeenNthCalledWith(2, filters, 2, 20);
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
});

describe('flattenMedicalRecordPages', () => {
  it('deduplicates overlapping ids while preserving backend order', () => {
    const first = createPage(1, 2);
    const repeated = first.items[0]!;
    const second: PaginatedMedicalRecords = {
      ...createPage(2, 2),
      items: [repeated, createRecord('unique-record')],
    };

    expect(flattenMedicalRecordPages([first, second]).map((record) => record.id)).toEqual([
      repeated.id,
      'unique-record',
    ]);
  });

  it('returns an empty list when there are no pages', () => {
    expect(flattenMedicalRecordPages(undefined)).toEqual([]);
  });
});
