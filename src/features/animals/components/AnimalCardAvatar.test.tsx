import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { mediaApi } from '../api/mediaApi';
import type { MediaAsset } from '../types';

import { AnimalCardAvatar } from './AnimalCardAvatar';

const MEDIA_ID = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

function createMediaAsset(): MediaAsset {
  return {
    id: MEDIA_ID,
    ownerType: 'animal',
    ownerId: null,
    resourceType: 'image',
    publicId: 'animals/luna',
    secureUrl: 'https://cdn.test/luna.jpg',
  };
}

describe('AnimalCardAvatar', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('renders the profile photo when the animal has a profilePhotoMediaId', async () => {
    const getById = jest.spyOn(mediaApi, 'getById').mockResolvedValue(createMediaAsset());
    const screen = await render(<AnimalCardAvatar name="Luna" profilePhotoMediaId={MEDIA_ID} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
    });
    expect(getById).toHaveBeenCalledWith(MEDIA_ID);
  });

  it('falls back to initials and does not fetch when there is no photo', async () => {
    const getById = jest.spyOn(mediaApi, 'getById');
    const screen = await render(<AnimalCardAvatar name="Luna" profilePhotoMediaId={null} />, {
      wrapper,
    });

    expect(screen.getByLabelText('Foto de Luna')).toHaveTextContent('LU');
    expect(screen.queryByTestId('app-avatar-image')).toBeNull();
    expect(getById).not.toHaveBeenCalled();
  });

  it('falls back to initials when fetching the photo fails', async () => {
    jest.spyOn(mediaApi, 'getById').mockRejectedValue(new Error('network'));
    const screen = await render(<AnimalCardAvatar name="Luna" profilePhotoMediaId={MEDIA_ID} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Foto de Luna')).toHaveTextContent('LU');
    });
    expect(screen.queryByTestId('app-avatar-image')).toBeNull();
  });
});
