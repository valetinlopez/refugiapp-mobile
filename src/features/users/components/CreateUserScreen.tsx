import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ConfirmDialog } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { useCreateUser } from '../hooks/useUserMutations';
import type { CreateUserRequest } from '../types';
import { roleLabel, toCreateUserErrorMessage } from '../utils/userPresentation';
import type { CreateUserFormValues } from '../utils/userSchema';
import { UserForm } from './UserForm';

export interface CreateUserScreenProps {
  onCancel(): void;
  onCreated(): void;
}

export function CreateUserScreen({ onCancel, onCreated }: CreateUserScreenProps) {
  const createUser = useCreateUser();
  const [pendingUser, setPendingUser] = useState<CreateUserRequest | null>(null);

  const closeConfirmation = useCallback(() => {
    if (createUser.isPending) return;
    createUser.reset();
    setPendingUser(null);
  }, [createUser]);

  const reviewUser = useCallback(
    (values: CreateUserFormValues) => {
      createUser.reset();
      setPendingUser(values);
    },
    [createUser]
  );

  const confirmCreation = useCallback(() => {
    if (!pendingUser) return;
    createUser.mutate(pendingUser, {
      onSuccess: () => {
        setPendingUser(null);
        onCreated();
      },
    });
  }, [createUser, onCreated, pendingUser]);

  const mutationError = createUser.error ? toCreateUserErrorMessage(createUser.error) : null;
  const roleSummary = pendingUser?.roles?.map(roleLabel).join(', ') ?? '';
  const consequence = pendingUser
    ? `Se creará la cuenta ${pendingUser.email} con los roles ${roleSummary}. La contraseña inicial no volverá a mostrarse.`
    : '';

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText accessibilityRole="header" variant="heading1">
          Crear usuario
        </AppText>
        <AppText color="textSecondary">
          Registrá al personal autorizado y definí sus permisos de acceso.
        </AppText>
        <UserForm isSubmitting={createUser.isPending} onCancel={onCancel} onSubmit={reviewUser} />
      </ScrollView>
      <ConfirmDialog
        cancelAccessibilityLabel="Volver al formulario"
        confirmAccessibilityLabel="Confirmar creación de usuario"
        confirmLabel="Crear usuario"
        confirming={createUser.isPending}
        consequence={consequence}
        errorMessage={mutationError}
        onCancel={closeConfirmation}
        onConfirm={confirmCreation}
        title="Confirmar nuevo usuario"
        variant="primary"
        visible={pendingUser !== null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});
