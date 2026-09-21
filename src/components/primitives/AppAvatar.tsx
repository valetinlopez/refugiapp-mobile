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

export function AppAvatar({
  accessibilityLabel,
  initials = '?',
  size = 'md',
  source,
  style,
  ...props
}: AppAvatarProps) {
  const dimension = avatarSizes[size];

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.frame, { height: dimension, width: dimension }, style]}
      {...props}
    >
      {source ? (
        <Image resizeMode="cover" source={source} style={styles.image} />
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
