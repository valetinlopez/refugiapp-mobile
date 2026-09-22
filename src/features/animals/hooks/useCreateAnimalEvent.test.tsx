import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalEventsApi } from '../api/animalEventsApi';

import { animalKeys } from './animalKeys';
import { useCreateAnimalEvent } from './useCreateAnimalEvent';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useCreateAnimalEvent', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false, gcTime: 0 },
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('invalidates the animal history after creating an event', async () => {
    jest.spyOn(animalEventsApi, 'create').mockResolvedValue({
      id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      animalId: ANIMAL_ID,
      eventType: 'general_note',
      description: 'Se adaptó correctamente.',
      occurredAt: '2026-09-21T14:30:00.000Z',
      createdByUserId: '9fa85f64-5717-4562-b3fc-2c963f66afa6',
      metadata: {},
    });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateAnimalEvent(ANIMAL_ID), { wrapper });

    result.current.mutate({
      eventType: 'general_note',
      description: 'Se adaptó correctamente.',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: animalKeys.history(ANIMAL_ID) });
  });
});
