import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBadge, AppButton, AppCard, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { UserResponse } from '../types';
import { roleLabel } from '../utils/userPresentation';

export const UserCard = memo(function UserCard({
  onChangeStatus,
  user,
}: {
  onChangeStatus(user: UserResponse): void;
  user: UserResponse;
}) {
  const fullName = `${user.firstName} ${user.lastName}`;
  return (
    <AppCard
      accessibilityLabel={`${fullName}, ${user.email}`}
      style={styles.card}
      variant="outlined"
    >
      <View style={styles.header}>
        <View style={styles.identity}>
          <AppText variant="heading3">{fullName}</AppText>
          <AppText color="textSecondary" style={styles.email}>
            {user.email}
          </AppText>
        </View>
        <AppBadge
          label={user.isActive ? 'Activo' : 'Inactivo'}
          tone={user.isActive ? 'positive' : 'neutral'}
        />
      </View>
      <View style={styles.roles}>
        {user.roles.map((role) => (
          <AppBadge key={role} label={roleLabel(role)} />
        ))}
      </View>
      <AppButton
        label={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
        onPress={() => onChangeStatus(user)}
        variant={user.isActive ? 'danger' : 'secondary'}
      />
    </AppCard>
  );
});

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  email: { flexShrink: 1 },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  identity: { flex: 1, gap: spacing.xxs },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
