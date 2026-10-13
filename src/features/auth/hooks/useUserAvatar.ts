import { useQuery } from '@tanstack/react-query';

import { profileApi } from '../api/profileApi';

import { userAvatarKeys } from './userAvatarKeys';

const AVATAR_CACHE_STALE_TIME = 5 * 60 * 1000;

export function useUserAvatar(mediaId: string | null | undefined) {
  return useQuery({
    queryKey: userAvatarKeys.asset(mediaId ?? ''),
    queryFn: () => profileApi.getAvatarAsset(mediaId as string),
    enabled: mediaId !== null && mediaId !== undefined && mediaId !== '',
    retry: 1,
    staleTime: AVATAR_CACHE_STALE_TIME,
    select: (asset) => asset.secureUrl,
  });
}
