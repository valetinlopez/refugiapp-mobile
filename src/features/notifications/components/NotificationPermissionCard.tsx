import { Linking, StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { PushPermissionState } from '../types';

export interface NotificationPermissionCardProps {
  isRequesting: boolean;
  onRequest(): void;
  permissionState: PushPermissionState;
}

export function NotificationPermissionCard({
  isRequesting,
  onRequest,
  permissionState,
}: NotificationPermissionCardProps) {
  if (permissionState === 'granted') {
    return (
      <AppCard testID="notifications-permission-granted" variant="outlined">
        <View style={styles.body}>
          <AppText variant="bodyStrong">Notificaciones activadas</AppText>
          <AppText color="textSecondary">
            Te avisaremos cuando una tarea de cuidado esté por vencer o vencida.
          </AppText>
        </View>
      </AppCard>
    );
  }

  if (permissionState === 'unavailable') {
    return (
      <AppCard testID="notifications-permission-unavailable" variant="outlined">
        <View style={styles.body}>
          <AppText variant="bodyStrong">Notificaciones no disponibles</AppText>
          <AppText color="textSecondary">
            Este dispositivo o esta versión no admiten notificaciones push. Podés seguir usando la
            app con normalidad.
          </AppText>
        </View>
      </AppCard>
    );
  }

  const blocked = permissionState === 'blocked';
  return (
    <AppCard testID="notifications-permission" variant="outlined">
      <View style={styles.body}>
        <AppText variant="bodyStrong">
          {blocked ? 'Notificaciones bloqueadas' : 'Activá las notificaciones'}
        </AppText>
        <AppText color="textSecondary">
          {blocked
            ? 'Las bloqueaste desde los ajustes del sistema. Habilitalas para recibir avisos de tareas.'
            : 'Autorizá los avisos para enterarte cuando una tarea esté por vencer o vencida.'}
        </AppText>
        <AppButton
          accessibilityLabel={blocked ? 'Abrir ajustes del sistema' : 'Activar notificaciones push'}
          label={blocked ? 'Abrir ajustes' : 'Activar notificaciones'}
          loading={!blocked && isRequesting}
          onPress={() => {
            if (blocked) {
              void Linking.openSettings();
              return;
            }
            onRequest();
          }}
          testID={blocked ? 'notifications-open-settings' : 'notifications-request'}
          variant="secondary"
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.sm },
});
