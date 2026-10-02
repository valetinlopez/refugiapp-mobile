import { router, type Href } from 'expo-router';
import { lazy, Suspense } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AppText } from '@/components/primitives';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useCreateUser } from '@/features/users/hooks/useUserMutations';
import { toUserErrorMessage } from '@/features/users/utils/userPresentation';
import { colors, spacing } from '@/theme';

const UserForm = lazy(async () => {
  const module = await import('@/features/users/components/UserForm');
  return { default: module.UserForm };
});

export default function NewUserRoute() {
  const { canManageUsers } = useCapabilities();
  const createUser = useCreateUser();
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
      <AccountHeaderRow accessibilityHint="Volver a usuarios" fallbackHref={usersHref} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Nuevo usuario</AppText>
        <AppText color="textSecondary">
          La contraseña inicial se envía de forma segura y no vuelve a mostrarse.
        </AppText>
        <Suspense fallback={<LoadingState label="Cargando formulario de usuario" />}>
          <UserForm
            errorMessage={createUser.error ? toUserErrorMessage(createUser.error) : null}
            isSubmitting={createUser.isPending}
            onSubmit={(values) =>
              createUser.mutate(
                {
                  email: values.email,
                  firstName: values.firstName,
                  lastName: values.lastName,
                  password: values.password,
                  roles: [values.role],
                },
                { onSuccess: () => router.replace(usersHref) }
              )
            }
          />
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
