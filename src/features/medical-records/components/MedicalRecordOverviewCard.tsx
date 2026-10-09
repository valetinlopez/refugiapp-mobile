import { Pressable, StyleSheet, View } from 'react-native';

import { AppAvatar, AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { opacity, sizes, spacing } from '@/theme';

import type { MedicalRecord } from '../types';
import { formatRecordDate, getRecordTypeLabel } from '../utils/medicalRecordPresentation';

export interface MedicalRecordOverviewCardProps {
  animalName: string;
  animalPhotoUri?: string | undefined;
  onPress?: (() => void) | undefined;
  record: MedicalRecord;
  veterinarianName: string;
}

/**
 * Global clinical history row.
 *
 * The animal and veterinarian names are resolved best-effort from shared caches
 * by the screen and always arrive as explicit labels, never raw UUIDs. The whole
 * card is a single accessible button when `onPress` opens the record detail.
 */
export function MedicalRecordOverviewCard({
  animalName,
  animalPhotoUri,
  onPress,
  record,
  veterinarianName,
}: MedicalRecordOverviewCardProps) {
  const typeLabel = getRecordTypeLabel(record.recordType);
  const date = formatRecordDate(record.occurredAt);
  const accessibilityLabel = `${record.title}, ${animalName}, ${typeLabel}, ${date}, ${veterinarianName}`;

  const card = (
    <AppCard style={styles.card} variant="elevated">
      <AppAvatar
        accessibilityLabel={`Animal: ${animalName}`}
        initials={animalName}
        size="md"
        source={animalPhotoUri === undefined ? undefined : { uri: animalPhotoUri }}
      />
      <View style={styles.content}>
        <AppText numberOfLines={1} variant="bodyStrong">
          {animalName}
        </AppText>
        <AppBadge
          icon="medical"
          label={typeLabel}
          labelNumberOfLines={1}
          style={styles.badge}
          tone="info"
        />
        <AppText numberOfLines={2} variant="bodyStrong">
          {record.title}
        </AppText>
        <View style={styles.metaRow}>
          <AppIcon color="textSecondary" name="calendar" size={sizes.iconSm} />
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {date}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <AppIcon color="textSecondary" name="account" size={sizes.iconSm} />
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {veterinarianName}
          </AppText>
        </View>
      </View>
      {onPress ? <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconMd} /> : null}
    </AppCard>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityHint="Abre el detalle del registro clínico"
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => (pressed ? styles.pressed : null)}
        testID="clinical-overview-card"
      >
        {card}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
      testID="clinical-overview-card"
    >
      {card}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', maxWidth: '100%' },
  card: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  pressed: { opacity: opacity.pressed },
});
