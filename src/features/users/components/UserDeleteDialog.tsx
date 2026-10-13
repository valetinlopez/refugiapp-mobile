import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ConfirmDialog } from '@/components/feedback';
import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export type UserDeleteStep = 'confirm' | 'acknowledge';

interface UserDeleteDialogProps {
  errorMessage?: string | null;
  name: string;
  onAdvance(): void;
  onCancel(): void;
  onConfirm(): void;
  step: UserDeleteStep | null;
  submitting: boolean;
}

export function UserDeleteDialog({
  errorMessage,
  name,
  onAdvance,
  onCancel,
  onConfirm,
  step,
  submitting,
}: UserDeleteDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <>
      <ConfirmDialog
        cancelAccessibilityLabel="Cancelar eliminación"
        confirmAccessibilityLabel={`Continuar con la eliminación de ${name}`}
        confirmLabel="Continuar"
        confirming={false}
        consequence={`Vas a eliminar a ${name} permanentemente. La cuenta perderá el acceso y la baja quedará auditada.`}
        onCancel={onCancel}
        onConfirm={onAdvance}
        title={`¿Eliminar a ${name} permanentemente?`}
        variant="danger"
        visible={step === 'confirm'}
      />
      <Modal
        animationType="fade"
        onRequestClose={onCancel}
        transparent
        visible={step === 'acknowledge'}
      >
        <View accessibilityViewIsModal style={styles.scrim}>
          <Pressable
            accessibilityLabel="Cancelar eliminación"
            accessibilityRole="button"
            disabled={submitting}
            hitSlop={sizes.hitSlop}
            onPress={onCancel}
            style={styles.backdrop}
          />
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={styles.card}
            testID="delete-user-acknowledge-dialog"
          >
            <AppText variant="heading3">Confirmar eliminación</AppText>
            <AppText color="textSecondary">
              {`Esta acción no se puede deshacer. ${name} dejará de aparecer en el padrón.`}
            </AppText>
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <AppText variant="label">Entiendo que es permanente</AppText>
                <AppText color="textSecondary" variant="caption">
                  Confirmá que querés eliminar esta cuenta de forma definitiva.
                </AppText>
              </View>
              <Switch
                accessibilityLabel="Entiendo que es permanente"
                accessibilityHint="Activá para habilitar la eliminación definitiva."
                disabled={submitting}
                onValueChange={setAcknowledged}
                testID="delete-user-acknowledge"
                thumbColor={acknowledged ? colors.textPrimary : colors.disabledText}
                trackColor={{ false: colors.disabledSurface, true: colors.positive }}
                value={acknowledged}
              />
            </View>
            {errorMessage ? (
              <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
                {errorMessage}
              </AppText>
            ) : null}
            <View style={styles.actions}>
              <AppButton
                disabled={submitting}
                label="Cancelar"
                onPress={onCancel}
                testID="delete-user-cancel"
                variant="ghost"
              />
              <AppButton
                accessibilityLabel={`Eliminar definitivamente a ${name}`}
                disabled={!acknowledged}
                label="Eliminar definitivamente"
                loading={submitting}
                onPress={onConfirm}
                testID="delete-user-confirm"
                variant="danger"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    maxWidth: sizes.dialogMaxWidth,
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
  switchCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
  },
});
