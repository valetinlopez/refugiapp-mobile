import { useState } from 'react';
import { Image, type ImageSource } from 'expo-image';
import {
  PixelRatio,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ViewProps,
} from 'react-native';

import { optimizeCloudinaryImageUrl } from '@/core/media';
import { colors, radii, sizes } from '@/theme';

import { AppText } from './AppText';

export type AppAvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AppAvatarShape = 'circle' | 'rounded';

export type AppAvatarProps = ViewProps & {
  accessibilityLabel: string;
  initials?: string;
  shape?: AppAvatarShape;
  size?: AppAvatarSize;
  source?: ImageSourcePropType | undefined;
};

const avatarSizes: Record<AppAvatarSize, number> = {
  sm: sizes.avatarSm,
  md: sizes.avatarMd,
  lg: sizes.avatarLg,
  xl: sizes.avatarXl,
};

function sourceUri(source: ImageSourcePropType | undefined): string | undefined {
  if (Array.isArray(source)) return source[0]?.uri;
  if (typeof source === 'object' && source !== null && 'uri' in source) return source.uri;
  return undefined;
}

export function AppAvatar({
  accessibilityLabel,
  initials = '?',
  shape = 'circle',
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
  const optimizedUri =
    uri === undefined
      ? undefined
      : optimizeCloudinaryImageUrl(uri, { width: dimension * PixelRatio.get() });
  const imageSource = (optimizedUri === undefined ? source : { uri: optimizedUri }) as ImageSource;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[
        styles.frame,
        shape === 'circle' ? styles.circle : styles.rounded,
        { height: dimension, width: dimension },
        style,
      ]}
      {...props}
    >
      {showImage ? (
        <Image
          allowDownscaling
          cachePolicy="memory-disk"
          contentFit="cover"
          loading="lazy"
          onError={() => setFailedUri(uri)}
          priority="low"
          recyclingKey={optimizedUri ?? uri ?? null}
          source={imageSource}
          style={styles.image}
          testID="app-avatar-image"
        />
      ) : (
        <AppText
          color="textPrimary"
          variant={size === 'lg' || size === 'xl' ? 'heading3' : 'label'}
        >
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
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle: {
    borderRadius: radii.full,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  rounded: {
    borderRadius: radii.lg,
  },
});
