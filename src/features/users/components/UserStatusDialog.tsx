import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';

export function UserStatusDialog({
  activating,
  errorMessage,
  name,
  onCancel,
  onConfirm,
  submitting,
  visible,
}: {
  activating: boolean;
  errorMessage?: string | null;
  name: string;
  onCancel(): void;
  onConfirm(): void;
  submitting: boolean;
  visible: boolean;
}) {
  const action = activating ? 'Activar' : 'Desactivar';
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.scrim}>
        <Pressable accessibilityLabel="Cancelar" onPress={onCancel} style={styles.backdrop} />
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.card}>
          <AppText variant="heading3">{action} usuario</AppText>
          <AppText color="textSecondary">
            {activating
              ? `${name} podrá volver a ingresar al sistema.`
              : `${name} perderá el acceso hasta que vuelvas a activar su cuenta.`}
          </AppText>
          {errorMessage ? (
            <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
              {errorMessage}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <AppButton disabled={submitting} label="Cancelar" onPress={onCancel} variant="ghost" />
            <AppButton
              label={`Confirmar ${action.toLowerCase()}`}
              loading={submitting}
              onPress={onConfirm}
              variant={activating ? 'primary' : 'danger'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
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
