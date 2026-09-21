import { Modal, StyleSheet, Pressable, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';

interface StatusConfirmDialogProps {
  consequence: string;
  label: string;
  onCancel(): void;
  onConfirm(): void;
  submitting: boolean;
  visible: boolean;
}

export function StatusConfirmDialog({
  consequence,
  label,
  onCancel,
  onConfirm,
  submitting,
  visible,
}: StatusConfirmDialogProps) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.scrim}>
        <Pressable
          accessibilityLabel="Cancelar cambio de estado"
          accessibilityRole="button"
          onPress={onCancel}
          style={styles.backdrop}
        />
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.card}>
          <AppText variant="heading3">Cambiar a “{label}”</AppText>
          <AppText color="textSecondary">{consequence}</AppText>
          <View style={styles.actions}>
            <AppButton disabled={submitting} label="Cancelar" onPress={onCancel} variant="ghost" />
            <AppButton
              label="Confirmar cambio"
              loading={submitting}
              onPress={onConfirm}
              variant={label === 'Fallecido' || label === 'Adoptado' ? 'danger' : 'primary'}
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
