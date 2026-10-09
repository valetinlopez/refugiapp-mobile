import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppAvatar, AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { opacity, sizes, spacing } from '@/theme';

import type { VeterinarianResponse } from '../types';
import {
  veterinarianAccessibilityLabel,
  veterinarianContactEmail,
  veterinarianContactPhone,
  veterinarianFullName,
  veterinarianInitials,
} from '../utils/veterinarianPresentation';

export interface VeterinarianCardProps {
  onPress(veterinarian: VeterinarianResponse): void;
  veterinarian: VeterinarianResponse;
}

export const VeterinarianCard = memo(function VeterinarianCard({
  onPress,
  veterinarian,
}: VeterinarianCardProps) {
  const name = veterinarianFullName(veterinarian);
  const email = veterinarianContactEmail(veterinarian);
  const phone = veterinarianContactPhone(veterinarian);
  const active = veterinarian.isActive;

  return (
    <Pressable
      accessibilityHint="Abre el perfil del veterinario"
      accessibilityLabel={veterinarianAccessibilityLabel(veterinarian)}
      accessibilityRole="button"
      onPress={() => onPress(veterinarian)}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
      testID="veterinarian-card"
    >
      <AppCard style={styles.card} variant="elevated">
        <AppAvatar
          accessibilityLabel={`Veterinario: ${name}`}
          initials={veterinarianInitials(veterinarian)}
          size="md"
        />
        <View style={styles.body}>
          <AppText numberOfLines={2} variant="heading3">
            {name}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="label">
            Matrícula {veterinarian.licenseNumber}
          </AppText>
          {email ? (
            <View style={styles.contactRow}>
              <AppIcon color="textSecondary" name="mail" size={sizes.iconSm} />
              <AppText color="textSecondary" numberOfLines={1} variant="caption">
                {email}
              </AppText>
            </View>
          ) : null}
          {phone ? (
            <View style={styles.contactRow}>
              <AppIcon color="textSecondary" name="phone" size={sizes.iconSm} />
              <AppText color="textSecondary" numberOfLines={1} variant="caption">
                {phone}
              </AppText>
            </View>
          ) : null}
        </View>
        <View style={styles.trailing}>
          <AppBadge
            icon={active ? 'check' : 'close'}
            label={active ? 'Activo' : 'Inactivo'}
            labelNumberOfLines={1}
            tone={active ? 'positive' : 'neutral'}
          />
          <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconMd} />
        </View>
      </AppCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
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
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  trailing: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: spacing.sm,
    maxWidth: '42%',
  },
});
