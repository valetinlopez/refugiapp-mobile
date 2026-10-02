import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
} from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { isUuid } from '@/core/validation';
import { colors, spacing } from '@/theme';

import { useUpdateUser, type UpdateUserInput } from '../hooks/useUserMutations';
import { useUser } from '../hooks/useUser';
import type { UpdateUserRequest } from '../types';
import { roleLabel, toUserErrorMessage } from '../utils/userPresentation';
import { hasRoleChanged, toUpdateUserPayload } from '../utils/userUpdate';
import type { UpdateUserFormValues } from '../utils/userSchema';
import { UserForm } from './UserForm';

export function UserEditScreen({ userId }: { userId: string }) {
  const userQuery = useUser(userId);
  const updateUser = useUpdateUser();
  const [pendingPayload, setPendingPayload] = useState<UpdateUserRequest | null>(null);
  const [noChangesNotice, setNoChangesNotice] = useState<string | null>(null);
  const user = userQuery.user;

  const closeRoleDialog = useCallback(() => {
    if (updateUser.isPending) return;
    setPendingPayload(null);
  }, [updateUser.isPending]);

  const mutate = useCallback(
    (payload: UpdateUserRequest) => {
      if (!user) return;
      const input: UpdateUserInput = { id: user.id, data: payload };
      updateUser.mutate(input, {
        onSuccess: () => {
          setPendingPayload(null);
          router.replace('/users');
        },
      });
    },
    [updateUser, user]
  );

  const handleSubmit = useCallback(
    (values: UpdateUserFormValues) => {
      if (!user) return;
      setNoChangesNotice(null);
      updateUser.reset();
      const payload = toUpdateUserPayload(user, values);
      if (!payload) {
        setNoChangesNotice('Sin cambios para guardar.');
        return;
      }
      if (payload.roles && hasRoleChanged(user, values.role)) {
        setPendingPayload(payload);
        return;
      }
      mutate(payload);
    },
    [mutate, updateUser, user]
  );

  const confirmRoleChange = useCallback(() => {
    if (pendingPayload) mutate(pendingPayload);
  }, [mutate, pendingPayload]);

  if (!isUuid(userId)) {
    return (
      <View style={styles.centered}>
        <ErrorState
          actionLabel="Volver a usuarios"
          message="El identificador del usuario no es válido."
          onAction={() => router.replace('/users')}
          title="Usuario no válido"
        />
      </View>
    );
  }

  if (userQuery.isPending) return <LoadingState label="Cargando usuario" />;
  if (userQuery.isError) {
    if (isNetworkError(userQuery.error)) {
      return (
        <OfflineState
          actionLabel={offlineCopy.actionLabel}
          message={offlineCopy.message}
          onAction={() => userQuery.refetch()}
          testID={OFFLINE_STATE_TEST_ID}
          title={offlineCopy.title}
        />
      );
    }
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={
          userQuery.error ? toUserErrorMessage(userQuery.error) : 'No se pudo cargar el usuario.'
        }
        onAction={() => userQuery.refetch()}
        title="No se pudo cargar el usuario"
      />
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <EmptyState
          actionLabel="Volver a usuarios"
          message="El usuario ya no está disponible en esta lista."
          onAction={() => router.replace('/users')}
          title="Usuario no disponible"
        />
      </View>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const mutationError = updateUser.error ? toUserErrorMessage(updateUser.error) : null;

  return (
    <View style={styles.container}>
      <AppText variant="heading1">Editar usuario</AppText>
      <AppText color="textSecondary">{fullName}</AppText>
      <UserForm
        errorMessage={mutationError ?? noChangesNotice}
        initialUser={user}
        isSubmitting={updateUser.isPending}
        mode="edit"
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        cancelAccessibilityLabel="Cancelar cambio de rol"
        confirmAccessibilityLabel="Confirmar cambio de rol"
        confirmLabel="Guardar cambios"
        confirming={updateUser.isPending}
        consequence={`${fullName} pasará a ${pendingPayload?.roles?.map(roleLabel).join(', ') ?? ''}. El cambio de rol queda auditado y puede rechazarse si es el último administrador activo.`}
        errorMessage={mutationError}
        onCancel={closeRoleDialog}
        onConfirm={confirmRoleChange}
        title="Cambiar rol"
        variant="primary"
        visible={pendingPayload !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
});
