import { useLocalSearchParams, type Href } from 'expo-router';
import { lazy, Suspense } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

const AuditLogDetail = lazy(async () => {
  const module = await import('@/features/audit/components/AuditLogDetail');
  return { default: module.AuditLogDetail };
});

export default function AuditDetailRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { canReadAudit } = useCapabilities();
  const id = typeof params.id === 'string' ? params.id : '';
  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver a auditoría" fallbackHref={'/audit' as Href} />
      {canReadAudit ? (
        <Suspense fallback={<LoadingState label="Cargando detalle de auditoría" />}>
          <AuditLogDetail id={id} />
        </Suspense>
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
