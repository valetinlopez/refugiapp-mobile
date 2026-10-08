import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalOptionsApi } from './animalOptionsApi';
import { useAnimalOptionPhoto } from './useAnimalOptionPhoto';

describe('useAnimalOptionPhoto', () => {
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

  it('resolves the photo URL when a media id exists', async () => {
    const getPhotoUrl = jest
      .spyOn(animalOptionsApi, 'getPhotoUrl')
      .mockResolvedValue('https://res.cloudinary.com/refugiapp/image/upload/animal.jpg');

    const { result } = await renderHook(() => useAnimalOptionPhoto('media-1'), { wrapper });

    await waitFor(() =>
      expect(result.current.data).toBe(
        'https://res.cloudinary.com/refugiapp/image/upload/animal.jpg'
      )
    );
    expect(getPhotoUrl).toHaveBeenCalledWith('media-1');
  });

  it('does not fetch when the animal has no profile photo', async () => {
    const getPhotoUrl = jest.spyOn(animalOptionsApi, 'getPhotoUrl');

    const { result } = await renderHook(() => useAnimalOptionPhoto(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getPhotoUrl).not.toHaveBeenCalled();
  });
});
