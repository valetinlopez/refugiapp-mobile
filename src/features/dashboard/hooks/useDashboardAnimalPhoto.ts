import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../api/dashboardApi';

import { dashboardKeys } from './dashboardKeys';

const MEDIA_CACHE_STALE_TIME = 5 * 60 * 1000;

export function useDashboardAnimalPhoto(mediaId: string | null) {
  return useQuery({
    queryKey: dashboardKeys.media(mediaId ?? ''),
    queryFn: () => dashboardApi.getAnimalPhoto(mediaId as string),
    enabled: mediaId !== null,
    retry: 1,
    staleTime: MEDIA_CACHE_STALE_TIME,
    select: (asset) => asset.secureUrl,
  });
}
