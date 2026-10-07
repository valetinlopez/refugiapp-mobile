import { router, type Href } from 'expo-router';
import { lazy, Suspense } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground } from '@/components/patterns';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

const CreateUserScreen = lazy(async () => {
  const module = await import('@/features/users/components/CreateUserScreen');
  return { default: module.CreateUserScreen };
});

export default function NewUserRoute() {
  const { canManageUsers } = useCapabilities();
  const usersHref = '/users' as Href;

  if (!canManageUsers) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow accessibilityHint="Volver a usuarios" fallbackHref={usersHref} />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Solo los administradores pueden crear usuarios."
            onAction={() => navigateBack('/')}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground overlay variant="texture" />
      <AccountHeaderRow accessibilityHint="Volver a usuarios" fallbackHref={usersHref} />
      <Suspense fallback={<LoadingState label="Cargando formulario de usuario" />}>
        <CreateUserScreen
          onCancel={() => navigateBack(usersHref)}
          onCreated={() => router.replace(usersHref)}
        />
      </Suspense>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
