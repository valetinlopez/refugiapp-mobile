import { useLocalSearchParams, type Href } from 'expo-router';
import { lazy, Suspense } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

const UserEditScreen = lazy(async () => {
  const module = await import('@/features/users/components/UserEditScreen');
  return { default: module.UserEditScreen };
});

export default function EditUserRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canManageUsers } = useCapabilities();
  const userId = typeof id === 'string' ? id : '';
  const usersHref = '/users' as Href;

  if (!canManageUsers) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow accessibilityHint="Volver a usuarios" fallbackHref={usersHref} />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Solo los administradores pueden editar usuarios."
            onAction={() => navigateBack('/')}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver a usuarios" fallbackHref={usersHref} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Suspense fallback={<LoadingState label="Cargando formulario de usuario" />}>
          <UserEditScreen userId={userId} />
        </Suspense>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
