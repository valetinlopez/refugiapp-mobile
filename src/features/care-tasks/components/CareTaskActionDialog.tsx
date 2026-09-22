import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';

export type CareTaskAction = 'complete' | 'cancel';

interface CareTaskActionDialogProps {
  action: CareTaskAction;
  onClose(): void;
  onConfirm(): void;
  submitting?: boolean;
  taskTitle: string;
  visible: boolean;
}

export function CareTaskActionDialog({
  action,
  onClose,
  onConfirm,
  submitting = false,
  taskTitle,
  visible,
}: CareTaskActionDialogProps) {
  const completing = action === 'complete';
  const verb = completing ? 'completar' : 'cancelar';

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.scrim}>
        <Pressable
          accessibilityLabel="Cerrar confirmación"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View accessibilityRole="alert" style={styles.card}>
          <AppText variant="heading3">¿Querés {verb} esta tarea?</AppText>
          <AppText color="textSecondary">
            “{taskTitle}” cambiará de estado y no podrá editarse.
          </AppText>
          <View style={styles.actions}>
            <AppButton disabled={submitting} label="Volver" onPress={onClose} variant="ghost" />
            <AppButton
              label={completing ? 'Confirmar completada' : 'Confirmar cancelación'}
              loading={submitting}
              onPress={onConfirm}
              variant={completing ? 'primary' : 'danger'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  backdrop: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
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
