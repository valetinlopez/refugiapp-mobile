import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';

export type AccountSignOutSheetProps = {
  errorMessage?: string | null;
  onClose(): void;
  onConfirm(): void;
  signingOut: boolean;
  userEmail: string;
  visible: boolean;
};

export function AccountSignOutSheet({
  errorMessage,
  onClose,
  onConfirm,
  signingOut,
  userEmail,
  visible,
}: AccountSignOutSheetProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.scrim}>
        <Pressable
          accessibilityLabel="Cancelar cierre de sesión"
          accessibilityRole="button"
          disabled={signingOut}
          onPress={onClose}
          style={styles.backdrop}
        />
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.card}>
          <AppText variant="heading3">¿Querés cerrar sesión?</AppText>
          <AppText color="textSecondary">Vas a salir de {userEmail} en este dispositivo.</AppText>
          {errorMessage ? (
            <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
              {errorMessage}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <AppButton disabled={signingOut} label="Cancelar" onPress={onClose} variant="ghost" />
            <AppButton
              accessibilityLabel="Confirmar cierre de sesión"
              label="Cerrar sesión"
              loading={signingOut}
              onPress={onConfirm}
              variant="danger"
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
