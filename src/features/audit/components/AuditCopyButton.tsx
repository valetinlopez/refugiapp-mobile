import { Pressable, StyleSheet } from 'react-native';

import { AppIcon } from '@/components/primitives';
import { colors, opacity, radii, sizes } from '@/theme';

export interface AuditCopyButtonProps {
  accessibilityLabel: string;
  copied: boolean;
  onPress: () => void;
  testID?: string;
}

/**
 * Icon-only copy control for audit identifiers (D33 / RFG-166).
 *
 * Keeps a 44 × 44 target with `hitSlop`, exposes a stable accessible label and
 * swaps glyph + tone on success so the state is never communicated by color
 * alone. The success announcement lives in `useCopyAuditText`.
 */
export function AuditCopyButton({
  accessibilityLabel,
  copied,
  onPress,
  testID,
}: AuditCopyButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={sizes.hitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      <AppIcon
        color={copied ? 'positive' : 'textSecondary'}
        name={copied ? 'check' : 'copy'}
        size={sizes.iconMd}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
