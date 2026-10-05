import { memo } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppAvatar, AppText } from '@/components/primitives';
import { sizes, spacing } from '@/theme';

import { formatDateTime, formatRelativeDateTime } from './dateFormat';

export type ActorRowProps = ViewProps & {
  accessibilityLabel: string;
  caption?: string | undefined;
  initials: string;
  occurredAt?: string | undefined;
  name: string;
};

function formatActorDate(occurredAt: string): string {
  const absolute = formatDateTime(occurredAt);
  if (!absolute) return '';
  const relative = formatRelativeDateTime(occurredAt);
  return relative ? `${relative} · ${absolute}` : absolute;
}

export const ActorRow = memo(function ActorRow({
  accessibilityLabel,
  caption,
  initials,
  occurredAt,
  name,
  style,
  ...props
}: ActorRowProps) {
  const dateLabel = occurredAt === undefined ? '' : formatActorDate(occurredAt);
  return (
    <View
      accessibilityLabel={`${name}${dateLabel ? `, ${dateLabel}` : ''}`}
      accessibilityRole="summary"
      style={[styles.container, style]}
      {...props}
    >
      <AppAvatar accessibilityLabel={accessibilityLabel} initials={initials} size="sm" />
      <View style={styles.details}>
        <AppText variant="bodyStrong">{name}</AppText>
        {caption ? (
          <AppText color="textSecondary" variant="caption">
            {caption}
          </AppText>
        ) : null}
        {dateLabel ? (
          <AppText color="textSecondary" variant="caption">
            {dateLabel}
          </AppText>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.avatarSm,
    paddingVertical: spacing.xs,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
});
