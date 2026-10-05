import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, radii, spacing, type ColorToken } from '@/theme';

import { passwordStrengthLevel, type PasswordStrengthLevel } from '../utils/passwordValidation';

const SEGMENT_COUNT = 3;

const levelConfig: Record<
  PasswordStrengthLevel,
  { label: string; segments: number; color: ColorToken }
> = {
  weak: { label: 'Débil', segments: 1, color: 'warning' },
  medium: { label: 'Media', segments: 2, color: 'info' },
  strong: { label: 'Fuerte', segments: 3, color: 'positive' },
};

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const level = passwordStrengthLevel(password);
  if (level === null) {
    return null;
  }

  const config = levelConfig[level];

  return (
    <View
      accessibilityLabel={`Fortaleza de la contraseña: ${config.label}`}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      accessible
      style={styles.container}
      testID="password-strength-meter"
    >
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.segments}
      >
        {Array.from({ length: SEGMENT_COUNT }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              index < config.segments && { backgroundColor: colors[config.color] },
            ]}
          />
        ))}
      </View>
      <AppText color={config.color} variant="caption">
        {config.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    backgroundColor: colors.border,
    borderRadius: radii.full,
    flex: 1,
    height: spacing.xxs,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
  },
});
