import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components/primitives';
import { colors, radii, spacing } from '@/theme';

interface ManagementCardProps {
  description: string;
  label: string;
  onPress(): void;
  variant: 'primary' | 'secondary';
}

export function ManagementCard({ description, label, onPress, variant }: ManagementCardProps) {
  const markerColor = variant === 'primary' ? colors.positive : colors.info;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard accessibilityLabel={label} variant="outlined">
        <View style={styles.content}>
          <View
            accessibilityRole="none"
            style={[styles.marker, { backgroundColor: markerColor }]}
          />
          <View style={styles.copy}>
            <AppText variant="heading3">{label}</AppText>
            <AppText color="textSecondary">{description}</AppText>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xxs },
  marker: { borderRadius: radii.sm, height: 8, width: 8 },
  pressable: { borderRadius: radii.lg },
  pressed: { opacity: 0.84 },
});
