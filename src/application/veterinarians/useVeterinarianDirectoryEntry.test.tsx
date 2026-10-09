import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { veterinarianDirectoryApi } from './veterinarianDirectoryApi';
import { useVeterinarianDirectoryEntry } from './useVeterinarianDirectoryEntry';

const VET_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useVeterinarianDirectoryEntry', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('loads one veterinarian by id', async () => {
    jest.spyOn(veterinarianDirectoryApi, 'getById').mockResolvedValue({
      id: VET_ID,
      name: 'Sofía Gómez',
      licenseNumber: 'MP 100',
    });

    const { result } = await renderHook(() => useVeterinarianDirectoryEntry(VET_ID), { wrapper });

    await waitFor(() => expect(result.current.data?.name).toBe('Sofía Gómez'));
    expect(veterinarianDirectoryApi.getById).toHaveBeenCalledWith(VET_ID);
  });

  it('does not request when no veterinarian is assigned', async () => {
    const getById = jest.spyOn(veterinarianDirectoryApi, 'getById');

    const { result } = await renderHook(() => useVeterinarianDirectoryEntry(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getById).not.toHaveBeenCalled();
  });
});
