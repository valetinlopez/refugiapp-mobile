import { memo } from 'react';

import { AppAvatar } from '@/components/primitives';

import { useAnimalPhoto } from '../hooks/useAnimalPhoto';

export interface AnimalCardAvatarProps {
  name: string;
  profilePhotoMediaId: string | null;
}

export const AnimalCardAvatar = memo(function AnimalCardAvatar({
  name,
  profilePhotoMediaId,
}: AnimalCardAvatarProps) {
  const photoQuery = useAnimalPhoto(profilePhotoMediaId);

  return (
    <AppAvatar
      accessibilityLabel={`Foto de ${name}`}
      initials={name.slice(0, 2)}
      source={photoQuery.data ? { uri: photoQuery.data } : undefined}
    />
  );
});
