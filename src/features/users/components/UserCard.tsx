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
  const roleText = user.roles.map(roleLabel).join(', ');
  const statusLabel = user.isActive ? 'Activo' : 'Inactivo';

  return (
    <AppCard
      accessibilityLabel={`${fullName}, ${user.email}, ${roleText}, ${statusLabel}`}
      style={styles.card}
      variant="outlined"
    >
      <View style={styles.header}>
        <View style={styles.identity}>
          <AppText
            accessibilityLabel={fullName}
            ellipsizeMode="tail"
            numberOfLines={1}
            variant="heading3"
          >
            {fullName}
          </AppText>
          <AppText
            accessibilityLabel={user.email}
            color="textSecondary"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {user.email}
          </AppText>
        </View>
        <AppBadge
          icon={user.isActive ? 'check' : 'close'}
          label={statusLabel}
          labelNumberOfLines={1}
          style={styles.status}
          tone={user.isActive ? 'positive' : 'neutral'}
        />
      </View>
      <View style={styles.roles}>
        {user.roles.map((role) => (
          <AppBadge key={role} label={roleLabel(role)} />
        ))}
      </View>
      <View style={styles.actions}>
        <AppButton
          label={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
          onPress={() => onChangeStatus(user)}
          variant={user.isActive ? 'secondary' : 'primary'}
        />
      </View>
    </AppCard>
  );
});

const styles = StyleSheet.create({
  actions: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: { gap: spacing.md },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  identity: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  roles: {
    columnGap: spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
  },
  status: { flexShrink: 0, maxWidth: '45%' },
});
