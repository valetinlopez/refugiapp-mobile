import { useQuery } from '@tanstack/react-query';

import { animalOptionsApi } from './animalOptionsApi';
import { animalOptionsKeys } from './animalOptionsKeys';

const PHOTO_STALE_TIME = 5 * 60 * 1000;

export function useAnimalOptionPhoto(mediaId: string | null | undefined) {
  const hasMediaId = typeof mediaId === 'string' && mediaId.length > 0;

  return useQuery({
    queryKey: animalOptionsKeys.photo(mediaId ?? ''),
    queryFn: async () => {
      if (!hasMediaId) throw new Error('Animal photo media id is required.');
      return animalOptionsApi.getPhotoUrl(mediaId);
    },
    enabled: hasMediaId,
    retry: 1,
    staleTime: PHOTO_STALE_TIME,
  });
}
