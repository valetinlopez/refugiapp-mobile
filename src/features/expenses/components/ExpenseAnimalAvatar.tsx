import { memo } from 'react';

import { useAnimalOptionPhoto } from '@/application/animals';
import { AppAvatar, type AppAvatarSize } from '@/components/primitives';

export interface ExpenseAnimalAvatarProps {
  name: string;
  profilePhotoMediaId?: string | null | undefined;
  size?: AppAvatarSize;
}

export const ExpenseAnimalAvatar = memo(function ExpenseAnimalAvatar({
  name,
  profilePhotoMediaId,
  size = 'md',
}: ExpenseAnimalAvatarProps) {
  const photoQuery = useAnimalOptionPhoto(profilePhotoMediaId);

  return (
    <AppAvatar
      accessibilityLabel={profilePhotoMediaId ? 'Foto de ' + name : 'Sin foto de ' + name}
      initials={name}
      size={size}
      source={photoQuery.data ? { uri: photoQuery.data } : undefined}
    />
  );
});
