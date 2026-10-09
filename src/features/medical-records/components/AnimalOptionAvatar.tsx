import { memo } from 'react';

import { useAnimalOptionPhoto, type AnimalOption } from '@/application/animals';
import { AppAvatar, type AppAvatarSize } from '@/components/primitives';

export interface AnimalOptionAvatarProps {
  animal: Pick<AnimalOption, 'name' | 'profilePhotoMediaId'>;
  size?: AppAvatarSize;
}

/**
 * Avatar for an animal option row: resolves the cached `GET /media/:id` photo
 * (one shared query per media id, no fetch when absent) and falls back to
 * initials silently, like the rest of the app.
 */
export const AnimalOptionAvatar = memo(function AnimalOptionAvatar({
  animal,
  size = 'md',
}: AnimalOptionAvatarProps) {
  const photoQuery = useAnimalOptionPhoto(animal.profilePhotoMediaId);

  return (
    <AppAvatar
      accessibilityLabel={
        animal.profilePhotoMediaId ? 'Foto de ' + animal.name : 'Sin foto de ' + animal.name
      }
      initials={animal.name}
      size={size}
      source={photoQuery.data ? { uri: photoQuery.data } : undefined}
    />
  );
});
