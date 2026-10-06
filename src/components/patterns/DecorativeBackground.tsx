import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, opacity } from '@/theme';

import { resolveBrandSource, type BrandAssetName } from './brandAssets';
import { DecorativeImage, type DecorativeImagePriority } from './DecorativeImage';

export type DecorativeBackgroundVariant = 'hero' | 'texture' | 'none';

export interface DecorativeBackgroundProps {
  /** Dims the artwork so foreground copy keeps its WCAG AA contrast. Defaults to true. */
  overlay?: boolean;
  /** Loading priority; the login hero (RFG-137) may raise it to `high`. */
  priority?: DecorativeImagePriority;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: DecorativeBackgroundVariant;
}

const sourceByVariant = {
  hero: 'heroRescuedDog',
  texture: 'leafTextureTile',
} as const satisfies Record<Exclude<DecorativeBackgroundVariant, 'none'>, BrandAssetName>;

/**
 * Full-bleed decorative backdrop for editorial screens (D03 / RFG-136).
 *
 * Composes the D02 brand assets through `DecorativeImage`, so the artwork is
 * always hidden from assistive technologies, never carries text and offers no
 * interactive target. The optional overlay keeps foreground copy readable over
 * the photographic hero. Screens render their content above this layer, which
 * is why the component fills its positioned parent absolutely.
 */
export function DecorativeBackground({
  overlay = true,
  priority = 'low',
  style,
  testID,
  variant = 'hero',
}: DecorativeBackgroundProps) {
  if (variant === 'none') return null;

  const brand = resolveBrandSource(sourceByVariant[variant]);

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.container, style]}
      testID={testID}
    >
      <DecorativeImage
        contentFit="cover"
        fallbackSource={brand.png}
        priority={priority}
        source={brand.webp}
        style={styles.image}
      />
      {overlay ? <View style={[StyleSheet.absoluteFill, styles.overlay]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    backgroundColor: colors.background,
    opacity: opacity.overlay,
  },
});
