import { StyleSheet, View, type ImageSourcePropType, type ViewProps } from 'react-native';

import { AppAvatar, AppBadge, AppText, type AppIconName } from '@/components/primitives';
import { spacing } from '@/theme';
import type { BadgeTone, CareTaskStatus } from '@/types/design-system';

export type TaskPresentation = {
  icon: AppIconName;
  label: string;
  tone: BadgeTone;
};

type ResolveTaskPresentationInput = {
  dueAt?: Date | undefined;
  isClinical?: boolean | undefined;
  now?: Date | undefined;
  status: CareTaskStatus;
  upcomingWindowHours?: number | undefined;
};

export function resolveTaskPresentation({
  dueAt,
  isClinical = false,
  now = new Date(),
  status,
  upcomingWindowHours = 24,
}: ResolveTaskPresentationInput): TaskPresentation {
  if (status === 'completed') {
    return { icon: 'check', label: 'Completada', tone: 'positive' };
  }
  if (status === 'cancelled') {
    return { icon: 'close', label: 'Cancelada', tone: 'neutral' };
  }
  if (dueAt && dueAt.getTime() < now.getTime()) {
    return { icon: 'alert', label: 'Vencida', tone: 'danger' };
  }
  if (dueAt && dueAt.getTime() - now.getTime() <= upcomingWindowHours * 60 * 60 * 1000) {
    return { icon: 'clock', label: 'Próxima', tone: 'warning' };
  }
  if (isClinical) {
    return { icon: 'medical', label: 'Clínica', tone: 'info' };
  }
  return { icon: 'clock', label: 'Pendiente', tone: 'default' };
}

export type TaskRowProps = ViewProps &
  ResolveTaskPresentationInput & {
    animalName: string;
    assignee?: string;
    avatarSource?: ImageSourcePropType | undefined;
    timeLabel: string;
    title: string;
  };

export function TaskRow({
  animalName,
  assignee,
  avatarSource,
  dueAt,
  isClinical,
  now,
  status,
  style,
  timeLabel,
  title,
  upcomingWindowHours,
  ...props
}: TaskRowProps) {
  const presentation = resolveTaskPresentation({
    dueAt,
    isClinical,
    now,
    status,
    upcomingWindowHours,
  });

  return (
    <View
      accessibilityLabel={`${timeLabel}, ${animalName}, ${title}, ${presentation.label}${assignee ? `, ${assignee}` : ''}`}
      style={[styles.container, style]}
      {...props}
    >
      <AppAvatar
        accessibilityLabel={`Foto de ${animalName}`}
        initials={animalName}
        size="md"
        source={avatarSource}
      />
      <View style={styles.details}>
        <AppText variant="bodyStrong">{`${timeLabel} · ${animalName}`}</AppText>
        <AppText color="textSecondary">{title}</AppText>
        {assignee ? (
          <AppText color="textSecondary" variant="caption">
            {assignee}
          </AppText>
        ) : null}
      </View>
      <AppBadge icon={presentation.icon} label={presentation.label} tone={presentation.tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 76,
    paddingVertical: spacing.sm,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
});
