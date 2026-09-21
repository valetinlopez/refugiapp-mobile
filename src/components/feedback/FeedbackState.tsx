import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppButton, AppCard, AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { spacing } from '@/theme';

type FeedbackStateProps = ViewProps & {
  actionLabel?: string;
  icon: AppIconName;
  message: string;
  onAction?: () => void;
  title: string;
  tone?: 'danger' | 'info' | 'neutral';
};

export function FeedbackState({
  actionLabel,
  icon,
  message,
  onAction,
  style,
  title,
  tone = 'neutral',
  ...props
}: FeedbackStateProps) {
  const iconColor = tone === 'danger' ? 'danger' : tone === 'info' ? 'info' : 'neutral';

  return (
    <AppCard
      accessibilityLiveRegion="polite"
      accessibilityRole={tone === 'danger' ? 'alert' : 'summary'}
      style={[styles.card, style]}
      variant="outlined"
      {...props}
    >
      <AppIcon color={iconColor} name={icon} size={28} />
      <View style={styles.copy}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText color="textSecondary">{message}</AppText>
      </View>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant={tone === 'danger' ? 'danger' : 'secondary'}
        />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  copy: {
    gap: spacing.xxs,
  },
});
