import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppButton, AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

import { useActivateUser, useDeactivateUser } from '../hooks/useUserMutations';
import { useUsers } from '../hooks/useUsers';
import type { UserResponse } from '../types';
import { toUserErrorMessage } from '../utils/userPresentation';
import { UserCard } from './UserCard';
import { UserStatusDialog } from './UserStatusDialog';

export function UsersScreen() {
  const usersQuery = useUsers();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [usersQuery.data]
  );
  const statusMutation = selectedUser?.isActive ? deactivateUser : activateUser;

  const closeStatusDialog = useCallback(() => {
    if (statusMutation.isPending) return;
    statusMutation.reset();
    setSelectedUser(null);
  }, [statusMutation]);

  const selectUser = useCallback(
    (user: UserResponse) => {
      activateUser.reset();
      deactivateUser.reset();
      setSelectedUser(user);
    },
    [activateUser, deactivateUser]
  );

  function confirmStatusChange(): void {
    if (!selectedUser) return;
    statusMutation.mutate(selectedUser.id, { onSuccess: () => setSelectedUser(null) });
  }

  if (usersQuery.isPending) return <LoadingState label="Cargando usuarios" />;
  if (usersQuery.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={toUserErrorMessage(usersQuery.error)}
        onAction={() => void usersQuery.refetch()}
        title="No se pudieron cargar los usuarios"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.title}>
          <AppText variant="heading1">Usuarios</AppText>
          <AppText color="textSecondary">
            {usersQuery.data.pages[0]?.total ?? 0} cuentas internas
          </AppText>
        </View>
        <AppButton
          icon="account"
          label="Nuevo usuario"
          onPress={() => router.push('/users/new' as Href)}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={users}
        testID="users-list"
        keyExtractor={(user) => user.id}
        ListFooterComponent={
          usersQuery.isFetchingNextPage ? <LoadingState label="Cargando más usuarios" /> : null
        }
        ListEmptyComponent={
          <EmptyState
            actionLabel="Crear usuario"
            message="Todavía no hay cuentas internas registradas."
            onAction={() => router.push('/users/new' as Href)}
            title="Sin usuarios"
          />
        }
        onEndReached={() => {
          if (usersQuery.hasNextPage && !usersQuery.isFetchingNextPage) {
            void usersQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={() => void usersQuery.refetch()}
            refreshing={usersQuery.isRefetching && !usersQuery.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={({ item }) => <UserCard onChangeStatus={selectUser} user={item} />}
      />
      <UserStatusDialog
        activating={selectedUser?.isActive === false}
        errorMessage={statusMutation.error ? toUserErrorMessage(statusMutation.error) : null}
        name={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
        onCancel={closeStatusDialog}
        onConfirm={confirmStatusChange}
        submitting={statusMutation.isPending}
        visible={selectedUser !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, gap: spacing.md, padding: spacing.lg },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  list: { gap: spacing.sm, paddingBottom: spacing['2xl'] },
  title: { flex: 1, gap: spacing.xxs },
});
