import { useQuery } from '@tanstack/react-query';

import { mediaApi } from '../api/mediaApi';

import { animalKeys } from './animalKeys';

const MEDIA_CACHE_STALE_TIME = 5 * 60 * 1000;

export function useAnimalPhoto(mediaId: string | null) {
  return useQuery({
    queryKey: animalKeys.media(mediaId ?? ''),
    queryFn: () => mediaApi.getById(mediaId as string),
    enabled: mediaId !== null,
    retry: 1,
    staleTime: MEDIA_CACHE_STALE_TIME,
    select: (asset) => asset.secureUrl,
  });
}
