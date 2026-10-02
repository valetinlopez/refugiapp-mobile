import { lazy, Suspense } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

const UsersScreen = lazy(async () => {
  const module = await import('@/features/users/components/UsersScreen');
  return { default: module.UsersScreen };
});

export default function UsersRoute() {
  const { canManageUsers } = useCapabilities();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver al inicio" fallbackHref="/" />
      {canManageUsers ? (
        <Suspense fallback={<LoadingState label="Cargando módulo de usuarios" />}>
          <UsersScreen />
        </Suspense>
      ) : (
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Solo los administradores pueden gestionar usuarios."
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
