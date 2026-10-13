import { AppAvatar, type AppAvatarSize } from '@/components/primitives';

interface UserAvatarProps {
  displayName: string;
  initials: string;
  photoUri?: string | null;
  size?: AppAvatarSize;
}

export function UserAvatar({ displayName, initials, photoUri, size = 'lg' }: UserAvatarProps) {
  const hasPhoto = photoUri !== null && photoUri !== undefined && photoUri !== '';
  return (
    <AppAvatar
      accessibilityLabel={
        hasPhoto ? `Foto de perfil de ${displayName}` : `Iniciales de ${displayName}`
      }
      initials={initials}
      size={size}
      source={hasPhoto ? { uri: photoUri } : undefined}
    />
  );
}
