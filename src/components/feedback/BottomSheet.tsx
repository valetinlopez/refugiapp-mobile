import { type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/primitives';
import { colors, radii, shadows, sizes, spacing } from '@/theme';

export interface BottomSheetProps {
  children: ReactNode;
  /** Accessible label for the backdrop; the sheet never closes silently to AT. */
  closeAccessibilityLabel?: string;
  onClose(): void;
  /** Enables deterministic E2E/component selectors. */
  testID?: string;
  title?: string;
  visible: boolean;
}

/**
 * Sheet inferior del sistema de diseño para selecciones y acciones con
 * contexto. Usa `Modal` nativo (`slide`) en lugar de una librería JS de bottom
 * sheets, por lo que hereda gesto de descarte, retroceso de Android y
 * accesibilidad de plataforma. No conoce endpoints, roles ni dominio: la
 * feature provee el contenido, los labels y los callbacks.
 *
 * El contenido desplaza dentro de una superficie acotada (`90 %`) para no
 * recortar opciones con fuente ampliada; el título expone `header` y el
 * backdrop conserva un target de 44 × 44.
 */
export function BottomSheet({
  children,
  closeAccessibilityLabel = 'Cerrar',
  onClose,
  testID = 'bottom-sheet',
  title,
  visible,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.scrim}>
        <Pressable
          accessibilityLabel={closeAccessibilityLabel}
          accessibilityRole="button"
          hitSlop={sizes.hitSlop}
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
          testID={testID}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.handle}
          />
          {title ? (
            <AppText accessibilityRole="header" variant="heading2">
              {title}
            </AppText>
          ) : null}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxs,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radii.full,
    height: spacing.xxs,
    width: spacing['2xl'],
  },
  scrim: {
    backgroundColor: colors.scrim,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    gap: spacing.md,
    maxHeight: '90%',
    maxWidth: sizes.dialogMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    width: '100%',
    ...shadows.raised,
  },
});
