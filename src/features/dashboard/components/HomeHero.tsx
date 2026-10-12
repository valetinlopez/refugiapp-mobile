import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { DecorativeImage, resolveBrandSource } from '@/components/patterns';
import { colors, spacing } from '@/theme';

/**
 * The `hero-home` master is a 16:9 photograph (4461×2500). The reserved aspect
 * ratio plus a viewport-proportional minimum height keep the header stable and
 * avoid layout shift on narrow screens or amplified fonts.
 */
const HERO_IMAGE_MIN_HEIGHT_FACTOR = 0.26;

/**
 * Full-bleed decorative hero for Inicio (D38.3 / RFG-174, header-first reorder).
 *
 * Reference `24-dashboard-home.jpeg` orders the screen as header → hero →
 * summary: the greeting (`HomeGreeting`) renders first on the solid page
 * background and this block only carries the `heroHome` photograph bleeding
 * edge to edge. The image is strictly decorative (hidden from assistive
 * technologies, `priority="high"` for the LCP, WebP + PNG fallback via
 * `resolveBrandSource`) and never holds functional copy.
 *
 * A subtle `LinearGradient` (`transparent` → `colors.background`, Expo SDK 57)
 * melts the bottom of the photo into the page so the "Resumen de hoy" card
 * overlaps a smooth blend instead of a hard cut or a visible band edge. Only
 * theme colors, no hexadecimals, no arbitrary measures.
 */
export function HomeHero() {
  const { height } = useWindowDimensions();
  const source = resolveBrandSource('heroHome');
  const imageMinHeight = Math.round(height * HERO_IMAGE_MIN_HEIGHT_FACTOR);

  return (
    <View style={styles.header} testID="home-hero">
      <DecorativeImage
        aspectRatio={16 / 9}
        contentFit="cover"
        fallbackSource={source.png}
        priority="high"
        source={source.webp}
        style={[styles.image, { minHeight: imageMinHeight }]}
        testID="home-hero-image"
      />
      <LinearGradient
        colors={[colors.transparent, colors.background]}
        pointerEvents="none"
        style={styles.fade}
        testID="home-hero-fade"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fade: {
    bottom: 0,
    height: spacing['3xl'],
    left: 0,
    position: 'absolute',
    right: 0,
  },
  header: {
    backgroundColor: colors.background,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
  },
});
