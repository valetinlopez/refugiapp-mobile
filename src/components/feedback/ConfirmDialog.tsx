import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';

export type ConfirmDialogVariant = 'primary' | 'danger';

export interface ConfirmDialogProps {
  cancelAccessibilityLabel?: string;
  cancelLabel?: string;
  confirmAccessibilityLabel?: string;
  confirmLabel: string;
  confirming?: boolean;
  consequence: string;
  errorMessage?: string | null | undefined;
  onCancel(): void;
  onConfirm(): void;
  title: string;
  variant?: ConfirmDialogVariant;
  visible: boolean;
}

/**
 * Diálogo de confirmación del sistema de diseño, sin `Alert` nativo.
 * Destinado a acciones con consecuencia (destructivas o no reversibles):
 * muestra el detalle de la consecuencia y exige confirmación explícita antes
 * de ejecutar. Mientras `confirming` está activo bloquea ambas acciones y
 * muestra carga en el botón de confirmación.
 */
export function ConfirmDialog({
  cancelAccessibilityLabel = 'Cerrar confirmación',
  cancelLabel = 'Cancelar',
  confirmAccessibilityLabel,
  confirmLabel,
  confirming = false,
  consequence,
  errorMessage,
  onCancel,
  onConfirm,
  title,
  variant = 'danger',
  visible,
}: ConfirmDialogProps) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.scrim}>
        <Pressable
          accessibilityLabel={cancelAccessibilityLabel}
          accessibilityRole="button"
          disabled={confirming}
          onPress={onCancel}
          style={styles.backdrop}
        />
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.card}>
          <AppText variant="heading3">{title}</AppText>
          <AppText color="textSecondary">{consequence}</AppText>
          {errorMessage ? (
            <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
              {errorMessage}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <AppButton
              disabled={confirming}
              label={cancelLabel}
              onPress={onCancel}
              variant="ghost"
            />
            <AppButton
              accessibilityLabel={confirmAccessibilityLabel ?? confirmLabel}
              label={confirmLabel}
              loading={confirming}
              onPress={onConfirm}
              variant={variant}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  backdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    gap: spacing.md,
    maxWidth: 480,
    padding: spacing.lg,
    width: '100%',
  },
  scrim: {
    alignItems: 'center',
    backgroundColor: colors.scrim,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
