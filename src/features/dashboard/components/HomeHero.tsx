import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { DecorativeImage, resolveBrandSource } from '@/components/patterns';
import { colors, opacity, sizes, spacing } from '@/theme';

export interface HomeHeroProps {
  /** Native copy rendered over the scrim band (greeting + account shortcut). */
  children: ReactNode;
}

/**
 * The `hero-home` master is a 16:9 photograph (4461×2500). The reserved image
 * height keeps the header stable and scales with the viewport, avoiding layout
 * shift while leaving the band below content-sized.
 */
const HERO_IMAGE_MIN_HEIGHT_FACTOR = 0.26;

/**
 * Full-bleed decorative hero for Inicio (D38.3 / RFG-174).
 *
 * Reuses the editorial pattern of the login hero (D04 / RFG-137): the `heroHome`
 * photograph bleeds edge to edge behind the greeting and the "Resumen de hoy"
 * card overlaps the bottom. The image is strictly decorative (hidden from
 * assistive technologies, `priority="high"` for the LCP, WebP + PNG fallback via
 * `resolveBrandSource`), while every piece of functional copy arrives as native
 * `children` over a local scrim band that keeps `textPrimary` readable regardless
 * of the subject behind it. The scrim is local, not a full overlay, so the top of
 * the photograph stays visible and editorial.
 */
export function HomeHero({ children }: HomeHeroProps) {
  const { height } = useWindowDimensions();
  const source = resolveBrandSource('heroHome');
  const imageMinHeight = Math.round(height * HERO_IMAGE_MIN_HEIGHT_FACTOR);

  return (
    <View style={styles.header} testID="home-hero">
      <DecorativeImage
        contentFit="cover"
        fallbackSource={source.png}
        priority="high"
        source={source.webp}
        style={[styles.image, { minHeight: imageMinHeight }]}
        testID="home-hero-image"
      />
      <View style={styles.band}>
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.bandAccent]}
          testID="home-hero-scrim"
        />
        <View style={styles.bandContent}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.scrim,
    position: 'relative',
    width: '100%',
  },
  bandAccent: {
    backgroundColor: colors.background,
    opacity: opacity.overlay,
  },
  bandContent: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    width: '100%',
  },
  header: {
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    width: '100%',
  },
});
