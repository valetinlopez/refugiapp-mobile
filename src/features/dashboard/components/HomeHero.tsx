import { StyleSheet, View } from 'react-native';

import { DecorativeImage, resolveBrandSource } from '@/components/patterns';
import { colors, radii } from '@/theme';

/** The `hero-home` master is a 16:9 photograph (4461×2500); the reserved ratio avoids layout shift. */
const HERO_ASPECT_RATIO = 16 / 9;

/**
 * Decorative dog + cat hero for Inicio (D36 / RFG-169).
 *
 * Composes the `hero-home` brand asset (photograph, see `docs/brand-assets.md`
 * for provenance) through `DecorativeImage`, which hides it from assistive
 * technologies, disables interactivity and falls back to the PNG when WebP
 * cannot be decoded. The banner never carries text or state, so the greeting
 * above stays the functional copy.
 */
export function HomeHero() {
  const source = resolveBrandSource('heroHome');

  return (
    <View style={styles.container} testID="home-hero">
      <DecorativeImage
        aspectRatio={HERO_ASPECT_RATIO}
        contentFit="cover"
        fallbackSource={source.png}
        priority="normal"
        source={source.webp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
});
