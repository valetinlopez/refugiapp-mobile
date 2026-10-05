import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { usePushPermission } from '../hooks/usePushPermission';
import { NotificationPermissionCard } from './NotificationPermissionCard';
import { NotificationPreferencesSection } from './NotificationPreferencesSection';

export function NotificationsSection() {
  const { isRequesting, requestPermission, state } = usePushPermission();

  return (
    <View style={styles.section} testID="notifications-section">
      <AppText variant="heading2">Notificaciones</AppText>
      <NotificationPermissionCard
        isRequesting={isRequesting}
        onRequest={requestPermission}
        permissionState={state}
      />
      <NotificationPreferencesSection />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
});
