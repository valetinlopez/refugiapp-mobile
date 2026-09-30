import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AuditLogsScreen } from '@/features/audit/components/AuditLogsScreen';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

export default function AuditRoute() {
  const { canReadAudit } = useCapabilities();
  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver al inicio" fallbackHref="/" />
      {canReadAudit ? (
        <AuditLogsScreen />
      ) : (
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Solo los administradores pueden consultar la auditoría."
            onAction={() => navigateBack('/')}
            title="Sin permiso"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
