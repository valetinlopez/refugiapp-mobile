import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalFilesApi } from '../api/animalFilesApi';

import { useAnimalFiles } from './useAnimalFiles';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createPage(page = 1, total = 1) {
  return {
    items: [
      {
        id: 'file-1',
        name: 'luna',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/luna.jpg',
        isImage: true,
        bytes: null,
        format: 'jpg',
      },
    ],
    page,
    limit: 20,
    total,
  };
}

describe('useAnimalFiles', () => {
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

  it('fetches the first page of the animal archive', async () => {
    const list = jest.spyOn(animalFilesApi, 'listByAnimal').mockResolvedValue(createPage());
    const { result } = await renderHook(() => useAnimalFiles(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(list).toHaveBeenCalledWith(ANIMAL_ID, 1, 20);
    expect(result.current.data?.pages[0]?.items[0]?.isImage).toBe(true);
  });

  it('requests the next page while preserving the server order', async () => {
    const list = jest
      .spyOn(animalFilesApi, 'listByAnimal')
      .mockResolvedValueOnce(createPage(1, 25))
      .mockResolvedValueOnce({
        ...createPage(2, 25),
        items: [{ ...createPage().items[0]!, id: 'file-2' }],
      });
    const { result } = await renderHook(() => useAnimalFiles(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(list).toHaveBeenLastCalledWith(ANIMAL_ID, 2, 20);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('is disabled when no animal id is provided', async () => {
    const list = jest.spyOn(animalFilesApi, 'listByAnimal');
    const { result } = await renderHook(() => useAnimalFiles(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(list).not.toHaveBeenCalled();
  });

  it('exposes a 403 as an error state', async () => {
    jest.spyOn(animalFilesApi, 'listByAnimal').mockRejectedValue({ status: 403 });
    const { result } = await renderHook(() => useAnimalFiles(ANIMAL_ID), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
  });
});
