import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, type AppIconName, AppText } from '@/components/primitives';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import { SectionHeader } from './SectionHeader';

export interface ManagementItem {
  description: string;
  hint: string;
  icon: AppIconName;
  id: string;
  label: string;
}

export interface ManagementSectionProps {
  items: readonly ManagementItem[];
  onSelect(id: string): void;
}

/**
 * Shared data-driven section for cross-domain management destinations.
 * Authorization and concrete routes stay with the application and route layers.
 */
export function ManagementSection({ items, onSelect }: ManagementSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader subtitle="Organizar hoy, más vidas mañana." title="Gestión" />
      <AppCard padded={false} variant="outlined">
        {items.map((item, index) => (
          <ManagementCard
            isLast={index === items.length - 1}
            item={item}
            key={item.id}
            onSelect={onSelect}
          />
        ))}
      </AppCard>
    </View>
  );
}

function ManagementCard({
  isLast,
  item,
  onSelect,
}: {
  isLast: boolean;
  item: ManagementItem;
  onSelect(id: string): void;
}) {
  return (
    <Pressable
      accessibilityHint={item.hint}
      accessibilityLabel={item.label}
      accessibilityRole="button"
      onPress={() => onSelect(item.id)}
      style={({ pressed }) => [
        styles.pressable,
        isLast && styles.lastPressable,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <AppIcon color="positive" name={item.icon} size={sizes.iconMd} />
        <View style={styles.copy}>
          <AppText variant="bodyStrong">{item.label}</AppText>
          <AppText color="textSecondary" variant="caption">
            {item.description}
          </AppText>
        </View>
        <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconSm} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  copy: { flex: 1, gap: spacing.xxs },
  lastPressable: { borderBottomWidth: 0 },
  pressable: {
    borderRadius: radii.lg,
    borderBottomColor: colors.divider,
    borderBottomWidth: sizes.divider,
    minHeight: sizes.touchTarget,
  },
  pressed: { opacity: opacity.pressed },
  section: { gap: spacing.md },
});
