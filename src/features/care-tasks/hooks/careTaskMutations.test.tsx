import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { careTasksApi } from '../api/careTasksApi';
import type { CareTask } from '../types';

import { careTaskKeys, dashboardQueryKey } from './careTaskKeys';
import { useCancelCareTask, useCompleteCareTask } from './useCareTaskActions';
import { useCreateCareTask } from './useCreateCareTask';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const TASK_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

function task(status: CareTask['status'] = 'pending'): CareTask {
  return {
    id: TASK_ID,
    animalId: ANIMAL_ID,
    title: 'Dar medicación',
    description: null,
    status,
    dueAt: null,
    completedAt: null,
    createdByUserId: null,
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

describe('care task mutations', () => {
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

  it('invalidates tasks and dashboard after creating', async () => {
    jest.spyOn(careTasksApi, 'create').mockResolvedValue(task());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateCareTask(), { wrapper });

    result.current.mutate({ animalId: ANIMAL_ID, title: 'Dar medicación' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: careTaskKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardQueryKey });
  });

  it('invalidates tasks and dashboard after completing', async () => {
    jest.spyOn(careTasksApi, 'complete').mockResolvedValue(task('completed'));
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCompleteCareTask(), { wrapper });

    result.current.mutate(TASK_ID);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: careTaskKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardQueryKey });
  });

  it('invalidates tasks and dashboard after cancelling', async () => {
    jest.spyOn(careTasksApi, 'cancel').mockResolvedValue(task('cancelled'));
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCancelCareTask(), { wrapper });

    result.current.mutate(TASK_ID);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: careTaskKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardQueryKey });
  });
});
