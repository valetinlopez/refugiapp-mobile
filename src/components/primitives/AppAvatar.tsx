import { useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type ViewProps } from 'react-native';

import { colors, radii, sizes } from '@/theme';

import { AppText } from './AppText';

export type AppAvatarSize = 'sm' | 'md' | 'lg';

export type AppAvatarProps = ViewProps & {
  accessibilityLabel: string;
  initials?: string;
  size?: AppAvatarSize;
  source?: ImageSourcePropType | undefined;
};

const avatarSizes: Record<AppAvatarSize, number> = {
  sm: sizes.avatarSm,
  md: sizes.avatarMd,
  lg: sizes.avatarLg,
};

function sourceUri(source: ImageSourcePropType | undefined): string | undefined {
  if (Array.isArray(source)) return source[0]?.uri;
  if (typeof source === 'object' && source !== null && 'uri' in source) return source.uri;
  return undefined;
}

export function AppAvatar({
  accessibilityLabel,
  initials = '?',
  size = 'md',
  source,
  style,
  ...props
}: AppAvatarProps) {
  const dimension = avatarSizes[size];
  const uri = sourceUri(source);
  const [failedUri, setFailedUri] = useState<string | undefined>(undefined);

  const imageFailed = uri !== undefined && failedUri === uri;
  const showImage = source !== undefined && !imageFailed;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.frame, { height: dimension, width: dimension }, style]}
      {...props}
    >
      {showImage ? (
        <Image
          onError={() => setFailedUri(uri)}
          resizeMode="cover"
          source={source}
          style={styles.image}
          testID="app-avatar-image"
        />
      ) : (
        <AppText color="textPrimary" variant={size === 'lg' ? 'heading3' : 'label'}>
          {initials.slice(0, 2).toUpperCase()}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
