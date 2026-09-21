import { useQuery } from '@tanstack/react-query';

import { mediaApi } from '../api/mediaApi';

import { animalKeys } from './animalKeys';

export function useAnimalPhoto(mediaId: string | null) {
  return useQuery({
    queryKey: animalKeys.media(mediaId ?? ''),
    queryFn: () => mediaApi.getById(mediaId as string),
    enabled: mediaId !== null,
    retry: 1,
    select: (asset) => asset.secureUrl,
  });
}
