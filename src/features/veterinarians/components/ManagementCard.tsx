import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, type AppIconName, AppText } from '@/components/primitives';
import { radii, sizes, spacing } from '@/theme';

interface ManagementCardProps {
  description: string;
  hint: string;
  icon: AppIconName;
  label: string;
  onPress(): void;
}

export function ManagementCard({ description, hint, icon, label, onPress }: ManagementCardProps) {
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard variant="outlined">
        <View style={styles.content}>
          <AppIcon color="textSecondary" name={icon} size={sizes.iconMd} />
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
  pressable: { borderRadius: radii.lg },
  pressed: { opacity: 0.84 },
});
