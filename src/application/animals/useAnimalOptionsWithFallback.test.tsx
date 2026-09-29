import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { ApiError } from '@/core/api';

import { animalOptionsApi } from './animalOptionsApi';
import { useAnimalOptionsWithFallback } from './useAnimalOptionsWithFallback';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function serverError(): ApiError {
  return new ApiError({
    code: 'HTTP_500',
    message: 'Ocurrió un error en el servidor. Intenta nuevamente.',
    requestId: 'req-1',
    status: 500,
  });
}

describe('useAnimalOptionsWithFallback', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false, gcTime: 0 },
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('returns the list when it succeeds and skips the single fetch', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockResolvedValue([{ id: ANIMAL_ID, name: 'Luna' }]);
    const getById = jest.spyOn(animalOptionsApi, 'getById');

    const { result } = await renderHook(() => useAnimalOptionsWithFallback(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([{ id: ANIMAL_ID, name: 'Luna' }]));
    expect(result.current.isFallback).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(getById).not.toHaveBeenCalled();
  });

  it('does not keep the loader pending forever when no animal id is given', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockResolvedValue([{ id: ANIMAL_ID, name: 'Luna' }]);
    const getById = jest.spyOn(animalOptionsApi, 'getById');

    const { result } = await renderHook(() => useAnimalOptionsWithFallback(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([{ id: ANIMAL_ID, name: 'Luna' }]));
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(getById).not.toHaveBeenCalled();
  });

  it('opens with the single animal when the list fails', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockRejectedValue(serverError());
    jest.spyOn(animalOptionsApi, 'getById').mockResolvedValue({ id: ANIMAL_ID, name: 'Luna' });

    const { result } = await renderHook(() => useAnimalOptionsWithFallback(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([{ id: ANIMAL_ID, name: 'Luna' }]));
    expect(result.current.isFallback).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  it('reports a mapped error when the list fails and no animal id is given', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockRejectedValue(
      new ApiError({
        code: 'HTTP_403',
        message: 'No tienes permiso para realizar esta acción.',
        requestId: 'req-1',
        status: 403,
      })
    );
    const getById = jest.spyOn(animalOptionsApi, 'getById');

    const { result } = await renderHook(() => useAnimalOptionsWithFallback(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe(
      'Tu rol no tiene permiso para consultar los animales.'
    );
    expect(result.current.isPending).toBe(false);
    expect(getById).not.toHaveBeenCalled();
  });

  it('reports a mapped server error and recovers through retry', async () => {
    jest
      .spyOn(animalOptionsApi, 'list')
      .mockRejectedValueOnce(serverError())
      .mockResolvedValueOnce([{ id: ANIMAL_ID, name: 'Luna' }]);

    const { result } = await renderHook(() => useAnimalOptionsWithFallback(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(result.current.errorMessage).toBe(
      'Ocurrió un error en el servidor. Intenta nuevamente.'
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toEqual([{ id: ANIMAL_ID, name: 'Luna' }]));
    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  it('does not attempt a fallback for a non-uuid animal param', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockRejectedValue(serverError());
    const getById = jest.spyOn(animalOptionsApi, 'getById');

    const { result } = await renderHook(() => useAnimalOptionsWithFallback('not-a-uuid'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getById).not.toHaveBeenCalled();
  });

  it('reports the fallback error when the list and the single animal both fail', async () => {
    jest.spyOn(animalOptionsApi, 'list').mockRejectedValue(serverError());
    jest.spyOn(animalOptionsApi, 'getById').mockRejectedValue(
      new ApiError({
        code: 'HTTP_404',
        message: 'No encontramos el recurso solicitado.',
        requestId: 'req-2',
        status: 404,
      })
    );

    const { result } = await renderHook(() => useAnimalOptionsWithFallback(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe('No encontramos el animal seleccionado.');
  });

  it('keeps the list when the animal is missing from it and fetches the single option as an extra', async () => {
    jest
      .spyOn(animalOptionsApi, 'list')
      .mockResolvedValue([{ id: '9aa98390-2695-4d5b-86e8-e043410a7fe8', name: 'Apolo' }]);
    jest.spyOn(animalOptionsApi, 'getById').mockResolvedValue({ id: ANIMAL_ID, name: 'Luna' });

    const { result } = await renderHook(() => useAnimalOptionsWithFallback(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.data?.length).toBe(2));
    expect(result.current.data).toContainEqual({ id: ANIMAL_ID, name: 'Luna' });
    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
  });
});
