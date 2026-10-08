import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';

/**
 * Indicador de borrador de la edición de animales (D16 / RFG-149).
 *
 * Comunica el estado "cambios sin guardar" con un punto y texto, de modo que
 * el estado nunca dependa solo del color. Es informativo (no interactivo) y se
 * anuncia de forma educada a las tecnologías asistivas.
 */
export function UnsavedChangesIndicator() {
  return (
    <View
      accessibilityLabel="Cambios sin guardar"
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      style={styles.container}
      testID="edit-dirty-badge"
    >
      <View style={styles.dot} />
      <AppText color="textSecondary" variant="caption">
        Cambios sin guardar
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    backgroundColor: colors.positive,
    borderRadius: radii.full,
    height: spacing.xs,
    width: spacing.xs,
  },
});
