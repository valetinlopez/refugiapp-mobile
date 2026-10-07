import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, type AppIconName, AppText } from '@/components/primitives';
import { opacity, radii, sizes, spacing } from '@/theme';

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
      <SectionHeader title="Gestión" />
      <View style={styles.cards}>
        {items.map((item) => (
          <ManagementCard item={item} key={item.id} onSelect={onSelect} />
        ))}
      </View>
    </View>
  );
}

function ManagementCard({ item, onSelect }: { item: ManagementItem; onSelect(id: string): void }) {
  return (
    <Pressable
      accessibilityHint={item.hint}
      accessibilityLabel={item.label}
      accessibilityRole="button"
      onPress={() => onSelect(item.id)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard variant="outlined">
        <View style={styles.content}>
          <AppIcon color="textSecondary" name={item.icon} size={sizes.iconMd} />
          <View style={styles.copy}>
            <AppText variant="heading3">{item.label}</AppText>
            <AppText color="textSecondary">{item.description}</AppText>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cards: { gap: spacing.sm },
  content: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xxs },
  pressable: { borderRadius: radii.lg, minHeight: sizes.touchTarget },
  pressed: { opacity: opacity.pressed },
  section: { gap: spacing.md },
});
