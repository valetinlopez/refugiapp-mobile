import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import {
  AppAvatar,
  AppBadge,
  AppCard,
  AppIcon,
  AppText,
  type AppIconName,
} from '@/components/primitives';
import { opacity, sizes, spacing } from '@/theme';
import type { BadgeTone } from '@/types/design-system';

export interface EntityCardBadge {
  icon?: AppIconName | undefined;
  label: string;
  tone?: BadgeTone | undefined;
}

export interface EntityCardAvatar {
  accessibilityLabel: string;
  initials: string;
  source?: ImageSourcePropType | undefined;
}

export interface EntityCardProps {
  accessibilityLabel?: string | undefined;
  avatar?: EntityCardAvatar | undefined;
  badge?: EntityCardBadge | undefined;
  /** Single-line supporting text (species, breed, license, date). */
  meta?: string | undefined;
  onPress?: (() => void) | undefined;
  /** Custom trailing content rendered before the chevron (e.g. a thumbnail). */
  trailing?: ReactNode;
  testID?: string | undefined;
  title: string;
}

function resolveEntityLabel(title: string, meta?: string, badge?: EntityCardBadge): string {
  return [title, meta, badge?.label].filter((part): part is string => Boolean(part)).join(', ');
}

/**
 * Shared entity card (D03 / RFG-136).
 *
 * The canonical row for animals, tasks, expenses, veterinarians and audit
 * entries: optional leading avatar, a flexible text column, an optional status
 * badge and a trailing slot. The text column uses `flex: 1` + `minWidth: 0` and
 * the badge/avatar never shrink, so a long name wraps before the status is
 * pushed off screen. Titles truncate to two lines while the accessible label
 * keeps the full text. When `onPress` is provided the whole card becomes a
 * single 44 pt+ accessible button with pressed feedback.
 */
export function EntityCard({
  accessibilityLabel,
  avatar,
  badge,
  meta,
  onPress,
  testID,
  title,
  trailing,
}: EntityCardProps) {
  const label = accessibilityLabel ?? resolveEntityLabel(title, meta, badge);
  const content = (
    <AppCard style={styles.card}>
      {avatar ? (
        <AppAvatar
          accessibilityLabel={avatar.accessibilityLabel}
          initials={avatar.initials}
          size="md"
          source={avatar.source}
        />
      ) : null}
      <View style={styles.body}>
        <AppText numberOfLines={2} variant="bodyStrong">
          {title}
        </AppText>
        {meta ? (
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {meta}
          </AppText>
        ) : null}
      </View>
      {trailing}
      {badge ? (
        <AppBadge
          icon={badge.icon}
          label={badge.label}
          labelNumberOfLines={1}
          style={styles.badge}
          tone={badge.tone}
        />
      ) : null}
      {onPress ? <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconMd} /> : null}
    </AppCard>
  );

  if (!onPress) {
    return (
      <View accessibilityLabel={label} accessibilityRole="summary" testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexShrink: 0,
    maxWidth: '45%',
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
